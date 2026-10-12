-- =====================================================================
-- Hair Korter — LAUNCH HARDENING  (idempotent — safe to re-run)
--
-- Run in the Supabase SQL Editor AFTER every other migration, i.e. after
--   security-hardening.sql  and  booking-management.sql.
-- It supersedes claim-profile.sql and invite-claim.sql (do not re-run those).
--
-- What this does:
--   1. Rate limiting helpers (per IP / per email / per stylist).
--   2. Multi-device sessions + real server-side sign-out.
--   3. Admin-issued password reset links.
--   4. Claim tokens moved OUT of the public `stylists` table, stored
--      hashed, and only mintable from the SQL Editor (all old links die).
--   5. Input validation on profiles, availability and bookings.
--   6. Booking integrity: server-side duration, no past slots, no
--      double-booking race, unique references, no fake "paid" amounts.
--   7. Storage: size/type limits, no anonymous uploads.
--   8. RLS re-lock (undoes permissive policies from older files).
--   9. Function grants: revoke EVERYTHING from the API roles, then
--      re-grant only the vetted RPC list. Ends with a self-check.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- 1. RATE LIMITING
-- ---------------------------------------------------------------------
create table if not exists public.rate_limits (
  bucket       text        not null,
  key          text        not null,
  window_start timestamptz not null,
  hits         int         not null default 0,
  primary key (bucket, key, window_start)
);
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

-- Caller IP as forwarded by the Supabase gateway (null if unavailable).
create or replace function public._client_ip()
returns text
language plpgsql
stable
set search_path = public, extensions
as $$
declare
  h jsonb;
begin
  begin
    h := nullif(current_setting('request.headers', true), '')::jsonb;
  exception when others then
    return null;
  end;
  if h is null then
    return null;
  end if;
  return nullif(trim(split_part(coalesce(
    h ->> 'cf-connecting-ip',
    h ->> 'x-forwarded-for',
    h ->> 'x-real-ip',
    ''), ',', 1)), '');
end;
$$;

-- Fixed-window counter. Raises 'rate_limited' once p_max is exceeded.
-- NOTE: if the calling function later raises, the increment is rolled
-- back — so callers that must count failures return empty instead.
create or replace function public._rate_limit(
  p_bucket text, p_key text, p_max int, p_window interval
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_secs  double precision := extract(epoch from p_window);
  v_start timestamptz;
  v_hits  int;
begin
  if p_key is null or p_key = '' then
    return;
  end if;
  v_start := to_timestamp(floor(extract(epoch from now()) / v_secs) * v_secs);

  insert into rate_limits (bucket, key, window_start, hits)
  values (p_bucket, p_key, v_start, 1)
  on conflict (bucket, key, window_start)
    do update set hits = rate_limits.hits + 1
  returning hits into v_hits;

  -- opportunistic cleanup
  if random() < 0.01 then
    delete from rate_limits where window_start < now() - interval '2 days';
  end if;

  if v_hits > p_max then
    raise exception 'rate_limited';
  end if;
end;
$$;

-- London "now" (bookings are in local time; the DB runs in UTC).
create or replace function public._london_now()
returns timestamp
language sql
stable
as $$ select (now() at time zone 'Europe/London'); $$;

-- ---------------------------------------------------------------------
-- 2. SESSIONS  (multiple devices, revocable)
-- ---------------------------------------------------------------------
create table if not exists public.stylist_sessions (
  token_hash text primary key,
  account_id uuid not null references public.stylist_accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists idx_stylist_sessions_account on public.stylist_sessions(account_id);
alter table public.stylist_sessions enable row level security;
revoke all on public.stylist_sessions from anon, authenticated;

-- Carry over existing single-session tokens so nobody is logged out.
insert into public.stylist_sessions (token_hash, account_id, expires_at)
select session_token_hash, id, session_expires_at
from public.stylist_accounts
where session_token_hash is not null and session_expires_at > now()
on conflict (token_hash) do nothing;

update public.stylist_accounts
set session_token_hash = null, session_expires_at = null
where session_token_hash is not null;

create or replace function public._account_id_for_token(p_token text)
returns uuid
language sql
stable
security definer
set search_path = public, extensions
as $$
  select account_id
  from stylist_sessions
  where p_token is not null
    and length(p_token) between 32 and 128
    and token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and expires_at > now()
  limit 1;
$$;

create or replace function public._issue_session(p_account_id uuid)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_token text := encode(gen_random_bytes(32), 'hex');
begin
  delete from stylist_sessions
  where account_id = p_account_id and expires_at <= now();

  insert into stylist_sessions (token_hash, account_id, expires_at)
  values (encode(digest(v_token, 'sha256'), 'hex'), p_account_id, now() + interval '30 days');

  -- keep at most 10 live sessions per account
  delete from stylist_sessions
  where account_id = p_account_id
    and token_hash in (
      select token_hash from stylist_sessions
      where account_id = p_account_id
      order by created_at desc
      offset 10
    );

  return v_token;
end;
$$;

create or replace function public.sign_up_stylist(
  p_email text,
  p_password text,
  p_name text
)
returns table (id uuid, email text, name text, stylist_id uuid, token text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_email text := lower(trim(p_email));
  v_name  text := trim(p_name);
  v_id    uuid;
begin
  perform public._rate_limit('signup_ip', public._client_ip(), 5, interval '1 hour');
  perform public._rate_limit('signup_all', 'global', 200, interval '1 hour');

  if v_email is null or length(v_email) > 254 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email';
  end if;
  if p_password is null or length(p_password) < 8 or length(p_password) > 72 then
    raise exception 'weak_password';
  end if;
  if v_name is null or length(v_name) = 0 or length(v_name) > 120 then
    raise exception 'invalid_name';
  end if;
  if exists (select 1 from stylist_accounts a where a.email = v_email) then
    raise exception 'email_taken';
  end if;

  insert into stylist_accounts (email, password_hash, name)
  values (v_email, crypt(p_password, gen_salt('bf', 12)), v_name)
  returning stylist_accounts.id into v_id;

  return query
    select a.id, a.email, a.name, a.stylist_id, public._issue_session(v_id)
    from stylist_accounts a
    where a.id = v_id;
end;
$$;

create or replace function public.sign_in_stylist(
  p_email text,
  p_password text
)
returns table (id uuid, email text, name text, stylist_id uuid, token text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_email text := lower(trim(p_email));
  v_id    uuid;
begin
  -- Counts every attempt; failures return no rows (no raise) so the
  -- counter is kept and brute force is throttled.
  perform public._rate_limit('signin_email', v_email, 10, interval '15 minutes');
  perform public._rate_limit('signin_ip', public._client_ip(), 30, interval '15 minutes');

  if p_password is null or length(p_password) > 72 then
    return;
  end if;

  select a.id into v_id
  from stylist_accounts a
  where a.email = v_email
    and a.password_hash = crypt(p_password, a.password_hash);

  if v_id is null then
    return;
  end if;

  update stylist_accounts set updated_at = now() where stylist_accounts.id = v_id;

  return query
    select a.id, a.email, a.name, a.stylist_id, public._issue_session(v_id)
    from stylist_accounts a
    where a.id = v_id;
end;
$$;

create or replace function public.sign_out_stylist(p_token text)
returns void
language sql
security definer
set search_path = public, extensions
as $$
  delete from stylist_sessions
  where p_token is not null
    and token_hash = encode(digest(p_token, 'sha256'), 'hex');
$$;

create or replace function public.get_account_by_token(p_token text)
returns table (id uuid, email text, name text, stylist_id uuid)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select a.id, a.email, a.name, a.stylist_id
  from stylist_accounts a
  where a.id = public._account_id_for_token(p_token);
$$;

-- ---------------------------------------------------------------------
-- 3. PASSWORD RESET  (admin-issued link; no email provider needed)
--    In the SQL Editor:
--      select public.admin_create_password_reset_link('stylist@email.com');
--    Send the returned link to the stylist (valid 24h, single use).
-- ---------------------------------------------------------------------
create table if not exists public.password_reset_tokens (
  token_hash text primary key,
  account_id uuid not null references public.stylist_accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at    timestamptz
);
alter table public.password_reset_tokens enable row level security;
revoke all on public.password_reset_tokens from anon, authenticated;

create or replace function public.admin_create_password_reset_link(
  p_email text,
  p_base_url text default 'https://hair-business-pied.vercel.app'
)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_acc   uuid;
  v_token text := encode(gen_random_bytes(32), 'hex');
begin
  select id into v_acc from stylist_accounts where email = lower(trim(p_email));
  if v_acc is null then
    raise exception 'no account with that email';
  end if;

  -- invalidate any outstanding links for this account
  delete from password_reset_tokens where account_id = v_acc;

  insert into password_reset_tokens (token_hash, account_id, expires_at)
  values (encode(digest(v_token, 'sha256'), 'hex'), v_acc, now() + interval '24 hours');

  return rtrim(p_base_url, '/') || '/stylist/reset-password?token=' || v_token;
end;
$$;

create or replace function public.reset_password_with_token(
  p_token text,
  p_new_password text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_acc uuid;
  v_hash text;
begin
  perform public._rate_limit('reset_ip', public._client_ip(), 10, interval '15 minutes');

  if p_new_password is null or length(p_new_password) < 8 or length(p_new_password) > 72 then
    raise exception 'weak_password';
  end if;
  if p_token is null or length(p_token) > 128 then
    raise exception 'invalid_reset_token';
  end if;

  v_hash := encode(digest(p_token, 'sha256'), 'hex');
  select account_id into v_acc
  from password_reset_tokens
  where token_hash = v_hash and used_at is null and expires_at > now()
  for update;

  if v_acc is null then
    raise exception 'invalid_reset_token';
  end if;

  update stylist_accounts
    set password_hash = crypt(p_new_password, gen_salt('bf', 12)), updated_at = now()
  where id = v_acc;

  update password_reset_tokens set used_at = now() where token_hash = v_hash;

  -- sign out every device
  delete from stylist_sessions where account_id = v_acc;
end;
$$;

-- ---------------------------------------------------------------------
-- 4. CLAIM TOKENS  (hashed, private table, SQL-Editor-only minting)
-- ---------------------------------------------------------------------
drop function if exists public.claim_stylist_profile(text, uuid);          -- tokenless overload
drop function if exists public.claim_stylist_profile(text, uuid, text);
drop function if exists public.generate_claim_url(uuid);
drop function if exists public.generate_all_claim_urls();

create table if not exists public.stylist_claim_tokens (
  stylist_id uuid primary key references public.stylists(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now()
);
alter table public.stylist_claim_tokens enable row level security;
revoke all on public.stylist_claim_tokens from anon, authenticated;

-- The old plaintext tokens were publicly readable => treat as leaked.
alter table public.stylists drop constraint if exists stylists_claim_token_key;
alter table public.stylists drop column if exists claim_token;

create or replace function public.claim_stylist_profile(
  p_token text,
  p_stylist_id uuid,
  p_claim_token text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_acc uuid := public._account_id_for_token(p_token);
begin
  if v_acc is null then
    raise exception 'unauthorized';
  end if;
  perform public._rate_limit('claim_acc', v_acc::text, 20, interval '1 hour');

  if exists (select 1 from stylist_accounts where id = v_acc and stylist_id is not null) then
    raise exception 'already_linked';
  end if;

  -- serialise concurrent claims of the same profile
  perform 1 from stylists where id = p_stylist_id for update;
  if not found then
    raise exception 'stylist_not_found';
  end if;

  if p_claim_token is null or length(p_claim_token) > 128 or not exists (
    select 1 from stylist_claim_tokens
    where stylist_id = p_stylist_id
      and token_hash = encode(digest(p_claim_token, 'sha256'), 'hex')
  ) then
    raise exception 'invalid_claim_token';
  end if;

  if exists (select 1 from stylist_accounts where stylist_id = p_stylist_id) then
    raise exception 'profile_already_claimed';
  end if;

  update stylist_accounts set stylist_id = p_stylist_id, updated_at = now() where id = v_acc;
  update stylists set verified = true, updated_at = now() where id = p_stylist_id;
  delete from stylist_claim_tokens where stylist_id = p_stylist_id;   -- one-time use
end;
$$;

-- SQL Editor only:  select public.admin_generate_claim_url('<stylist uuid>');
create or replace function public.admin_generate_claim_url(
  p_stylist_id uuid,
  p_base_url text default 'https://hair-business-pied.vercel.app'
)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_token text := encode(gen_random_bytes(32), 'hex');
begin
  if not exists (select 1 from stylists where id = p_stylist_id) then
    raise exception 'stylist not found';
  end if;
  if exists (select 1 from stylist_accounts where stylist_id = p_stylist_id) then
    raise exception 'profile already claimed';
  end if;

  insert into stylist_claim_tokens (stylist_id, token_hash)
  values (p_stylist_id, encode(digest(v_token, 'sha256'), 'hex'))
  on conflict (stylist_id) do update
    set token_hash = excluded.token_hash, created_at = now();

  return rtrim(p_base_url, '/') || '/stylist/claim?id=' || p_stylist_id::text || '&token=' || v_token;
end;
$$;

-- SQL Editor only:  select * from public.admin_generate_all_claim_urls();
-- (Re-running invalidates previously generated links.)
create or replace function public.admin_generate_all_claim_urls(
  p_base_url text default 'https://hair-business-pied.vercel.app'
)
returns table (stylist_id uuid, stylist_name text, claim_url text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  r record;
begin
  for r in
    select s.id, s.name from stylists s
    where not exists (select 1 from stylist_accounts a where a.stylist_id = s.id)
    order by s.name
  loop
    stylist_id := r.id;
    stylist_name := r.name;
    claim_url := public.admin_generate_claim_url(r.id, p_base_url);
    return next;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- 5. INPUT VALIDATION — profiles & availability
-- ---------------------------------------------------------------------
-- Accepts http(s) URLs or bare domains (prefixed with https://).
-- Rejects javascript:, data:, etc.
create or replace function public._normalise_url(p text)
returns text
language plpgsql
immutable
as $$
declare
  v text := trim(coalesce(p, ''));
begin
  if v = '' then
    return null;
  end if;
  if length(v) > 1000 or v ~ '[\s<>"''`]' then
    raise exception 'invalid_url';
  end if;
  if v !~* '^https?://' then
    if v ~* '^[a-z][a-z0-9+.-]*:(?![0-9])' then
      raise exception 'invalid_url';     -- some other scheme
    end if;
    v := 'https://' || v;
  end if;
  return v;
end;
$$;

create or replace function public._validate_profile_payload(p jsonb, p_is_create boolean)
returns void
language plpgsql
as $$
declare
  s jsonb;
begin
  if p is null or jsonb_typeof(p) <> 'object' then
    raise exception 'invalid_profile';
  end if;
  if (p_is_create or p ? 'name')
     and (length(trim(coalesce(p->>'name', ''))) = 0 or length(p->>'name') > 120) then
    raise exception 'invalid_name';
  end if;
  if length(coalesce(p->>'tagline', '')) > 200 then
    raise exception 'tagline_too_long';
  end if;
  if length(coalesce(p->>'bio', '')) > 3000 then
    raise exception 'bio_too_long';
  end if;
  if p ? 'yearsExperience' and coalesce(p->>'yearsExperience', '') <> ''
     and (p->>'yearsExperience')::int not between 0 and 80 then
    raise exception 'invalid_experience';
  end if;
  if p ? 'specialties' and (
       jsonb_typeof(p->'specialties') <> 'array'
       or jsonb_array_length(p->'specialties') > 9) then
    raise exception 'invalid_specialties';
  end if;
  if p ? 'services' then
    if jsonb_typeof(p->'services') <> 'array' or jsonb_array_length(p->'services') > 50 then
      raise exception 'invalid_services';
    end if;
    for s in select * from jsonb_array_elements(p->'services')
    loop
      if jsonb_typeof(s) <> 'object'
         or length(trim(coalesce(s->>'name', ''))) = 0
         or length(s->>'name') > 120
         or length(coalesce(s->>'duration', '')) > 40
         or coalesce((s->>'price')::numeric, 0) not between 0 and 100000 then
        raise exception 'invalid_services';
      end if;
    end loop;
  end if;
  -- URL fields: validated (raises on bad input)
  perform public._normalise_url(p->>'bookingUrl');
  perform public._normalise_url(p->>'avatarUrl');
  perform public._normalise_url(p->>'coverImageUrl');
end;
$$;

create or replace function public._validate_slots(p jsonb)
returns void
language plpgsql
immutable
as $$
begin
  if p is null then
    return;
  end if;
  if jsonb_typeof(p) <> 'array' or jsonb_array_length(p) > 96 then
    raise exception 'invalid_slots';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p) e
    where jsonb_typeof(e) <> 'string'
       or (e #>> '{}') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
  ) then
    raise exception 'invalid_slots';
  end if;
end;
$$;

create or replace function public.create_stylist_profile(
  p_token text,
  p_payload jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_acc uuid := public._account_id_for_token(p_token);
  v_id uuid;
begin
  if v_acc is null then
    raise exception 'unauthorized';
  end if;
  perform 1 from stylist_accounts where id = v_acc for update;
  if exists (select 1 from stylist_accounts where id = v_acc and stylist_id is not null) then
    raise exception 'already_linked';
  end if;
  perform public._validate_profile_payload(p_payload, true);

  insert into stylists (
    name, tagline, bio, region, years_experience, price_range,
    avatar_url, cover_image_url, featured, booking_url
  )
  values (
    trim(p_payload->>'name'),
    coalesce(p_payload->>'tagline', ''),
    coalesce(p_payload->>'bio', ''),
    (p_payload->>'region')::region,
    coalesce(nullif(p_payload->>'yearsExperience', '')::int, 0),
    coalesce((p_payload->>'priceRange')::price_range, '££'),
    coalesce(public._normalise_url(p_payload->>'avatarUrl'),
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face'),
    coalesce(public._normalise_url(p_payload->>'coverImageUrl'),
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=400&fit=crop'),
    false,
    null
  )
  returning id into v_id;

  insert into stylist_specialties (stylist_id, specialty)
  select v_id, x::specialty
  from jsonb_array_elements_text(coalesce(p_payload->'specialties', '[]'::jsonb)) as x
  on conflict do nothing;

  insert into services (stylist_id, name, price, duration)
  select v_id, trim(s->>'name'), greatest(0, coalesce((s->>'price')::numeric, 0))::int,
         coalesce(s->>'duration', '1 hr')
  from jsonb_array_elements(coalesce(p_payload->'services', '[]'::jsonb)) as s;

  insert into stylist_availability (stylist_id, day_of_week, start_time, end_time, is_available)
  select v_id, d, '09:00'::time, '21:00'::time, d <> 0
  from generate_series(0, 6) as d
  on conflict (stylist_id, day_of_week) do nothing;

  update stylist_accounts set stylist_id = v_id, updated_at = now()
  where id = v_acc and stylist_id is null;

  return v_id;
end;
$$;

create or replace function public.update_stylist_profile(
  p_token text,
  p_stylist_id uuid,
  p_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  perform public._assert_owns(p_token, p_stylist_id);
  perform public._validate_profile_payload(p_payload, false);

  update stylists set
    name             = coalesce(nullif(trim(p_payload->>'name'), ''), name),
    tagline          = coalesce(p_payload->>'tagline', tagline),
    bio              = coalesce(p_payload->>'bio', bio),
    region           = coalesce((p_payload->>'region')::region, region),
    years_experience = coalesce(nullif(p_payload->>'yearsExperience', '')::int, years_experience),
    price_range      = coalesce((p_payload->>'priceRange')::price_range, price_range),
    booking_url      = case when p_payload ? 'bookingUrl'
                            then public._normalise_url(p_payload->>'bookingUrl')
                            else booking_url end,
    avatar_url       = coalesce(public._normalise_url(p_payload->>'avatarUrl'), avatar_url),
    cover_image_url  = coalesce(public._normalise_url(p_payload->>'coverImageUrl'), cover_image_url),
    updated_at       = now()
  where id = p_stylist_id;

  if p_payload ? 'specialties' then
    delete from stylist_specialties where stylist_id = p_stylist_id;
    insert into stylist_specialties (stylist_id, specialty)
    select p_stylist_id, x::specialty
    from jsonb_array_elements_text(p_payload->'specialties') as x
    on conflict do nothing;
  end if;

  if p_payload ? 'services' then
    delete from services where stylist_id = p_stylist_id;
    insert into services (stylist_id, name, price, duration)
    select p_stylist_id, trim(s->>'name'), greatest(0, coalesce((s->>'price')::numeric, 0))::int,
           coalesce(s->>'duration', '1 hr')
    from jsonb_array_elements(p_payload->'services') as s;
  end if;
end;
$$;

create or replace function public.update_stylist_deposit(
  p_token text,
  p_stylist_id uuid,
  p_type text,
  p_value numeric
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  perform public._assert_owns(p_token, p_stylist_id);
  if p_type not in ('none', 'percentage', 'fixed') then
    raise exception 'invalid_deposit_type';
  end if;

  update stylists set
    deposit_type  = p_type,
    deposit_value = case
                      when p_type = 'none' then 0
                      when p_type = 'percentage' then least(100, greatest(0, coalesce(p_value, 0)))
                      else least(100000, greatest(0, coalesce(p_value, 0)))
                    end,
    updated_at = now()
  where id = p_stylist_id;
end;
$$;

create or replace function public.update_availability(
  p_token text,
  p_stylist_id uuid,
  p_day int,
  p_is_available boolean,
  p_slots jsonb
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  perform public._assert_owns(p_token, p_stylist_id);
  if p_day < 0 or p_day > 6 then
    raise exception 'invalid_day';
  end if;
  perform public._validate_slots(p_slots);

  insert into stylist_availability (stylist_id, day_of_week, is_available, slots)
  values (p_stylist_id, p_day, coalesce(p_is_available, true), coalesce(p_slots, '[]'::jsonb))
  on conflict (stylist_id, day_of_week) do update
    set is_available = coalesce(p_is_available, stylist_availability.is_available),
        slots        = coalesce(p_slots, stylist_availability.slots);
end;
$$;

create or replace function public.release_date(
  p_token text,
  p_stylist_id uuid,
  p_date date,
  p_slots jsonb
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  perform public._assert_owns(p_token, p_stylist_id);
  perform public._validate_slots(p_slots);
  if p_date is null
     or p_date < public._london_now()::date
     or p_date > public._london_now()::date + 366 then
    raise exception 'invalid_date';
  end if;

  insert into stylist_date_availability (stylist_id, date, slots, is_open, updated_at)
  values (p_stylist_id, p_date, coalesce(p_slots, '[]'::jsonb), true, now())
  on conflict (stylist_id, date) do update
    set slots = excluded.slots, is_open = true, updated_at = now();
end;
$$;

-- ---------------------------------------------------------------------
-- 6. BOOKINGS
-- ---------------------------------------------------------------------
-- Mirrors the client parser: first "<number> <hr|min>" in the text, else 60.
create or replace function public._parse_duration_mins(p text)
returns int
language plpgsql
immutable
as $$
declare
  m text[];
begin
  m := regexp_match(coalesce(p, ''), '([0-9]+(?:\.[0-9]+)?)\s*(hours|hour|hrs|hr|minutes|mins|min)', 'i');
  if m is null then
    return 60;
  end if;
  if lower(m[2]) like 'h%' then
    return greatest(1, round(m[1]::numeric * 60))::int;
  end if;
  return greatest(1, round(m[1]::numeric))::int;
end;
$$;

-- Unique references (skipped with a notice if legacy duplicates exist).
do $$
begin
  create unique index if not exists uniq_bookings_reference
    on public.bookings(reference) where reference is not null;
exception when unique_violation then
  raise notice 'Duplicate booking references exist — unique index not created.';
end;
$$;

drop function if exists public.pay_balance(uuid, text);   -- recorded fake payments

-- p_duration_mins is accepted for API compatibility but IGNORED:
-- the duration always comes from the service catalogue.
create or replace function public.create_booking(
  p_stylist_id text,
  p_service_name text,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_date date,
  p_start time,
  p_duration_mins int,
  p_payment_option text,
  p_notes text
)
returns table (
  id uuid, stylist_id uuid, service_name text, service_price int,
  customer_name text, customer_email text, customer_phone text,
  booking_date date, start_time time, end_time time, status text, notes text,
  created_at timestamptz, payment_option text, deposit_amount int,
  total_price int, amount_paid int, paid_in_full boolean,
  reference text, manage_token text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_sid uuid := p_stylist_id::uuid;
  v_email text := lower(trim(p_customer_email));
  v_price int;
  v_duration text;
  v_mins int;
  v_dep_type text;
  v_dep_val numeric;
  v_deposit int;
  v_end time;
  v_slots jsonb;
  v_ref text;
  v_token text := encode(gen_random_bytes(32), 'hex');
  v_option text := case when p_payment_option = 'deposit' then 'deposit' else 'full' end;
  v_new_id uuid;
begin
  perform public._rate_limit('booking_ip', public._client_ip(), 10, interval '1 hour');
  perform public._rate_limit('booking_email', v_email, 5, interval '1 hour');
  perform public._rate_limit('booking_stylist', v_sid::text, 40, interval '1 hour');

  if coalesce(trim(p_customer_name), '') = '' or length(p_customer_name) > 120 then
    raise exception 'invalid_customer';
  end if;
  if v_email is null or length(v_email) > 254 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email';
  end if;
  if length(coalesce(p_customer_phone, '')) > 30 then
    raise exception 'invalid_phone';
  end if;
  if length(coalesce(p_notes, '')) > 1000 then
    raise exception 'notes_too_long';
  end if;
  if p_service_name is null or length(p_service_name) > 200 then
    raise exception 'invalid_service';
  end if;
  if p_date is null or p_start is null then
    raise exception 'slot_unavailable';
  end if;
  if (p_date + p_start) <= public._london_now() then
    raise exception 'slot_in_past';
  end if;

  select s.price, s.duration into v_price, v_duration
  from services s where s.stylist_id = v_sid and s.name = p_service_name
  order by s.price limit 1;
  if v_price is null then
    raise exception 'invalid_service';
  end if;

  v_mins := public._parse_duration_mins(v_duration);
  if extract(epoch from p_start) / 60 + v_mins > 24 * 60 then
    raise exception 'slot_unavailable';   -- would run past midnight
  end if;
  v_end := p_start + make_interval(mins => v_mins);

  -- serialise bookings per stylist => no double-booking race
  perform pg_advisory_xact_lock(hashtextextended('booking:' || v_sid::text, 0));

  select sda.slots into v_slots from stylist_date_availability sda
  where sda.stylist_id = v_sid and sda.date = p_date and sda.is_open = true;
  if v_slots is null or not (v_slots ? to_char(p_start, 'HH24:MI')) then
    raise exception 'slot_unavailable';
  end if;

  if exists (
    select 1 from bookings b
    where b.stylist_id = v_sid and b.booking_date = p_date
      and b.status <> 'cancelled'
      and p_start < b.end_time and v_end > b.start_time
  ) then
    raise exception 'slot_taken';
  end if;

  select st.deposit_type, st.deposit_value into v_dep_type, v_dep_val
  from stylists st where st.id = v_sid;

  if v_option = 'deposit' and v_dep_type in ('percentage', 'fixed') and coalesce(v_dep_val, 0) > 0 then
    v_deposit := case when v_dep_type = 'percentage'
                      then round(v_price * v_dep_val / 100.0)
                      else least(v_dep_val, v_price) end;
  else
    v_deposit := 0;
    v_option := 'full';
  end if;

  loop
    v_ref := upper(encode(gen_random_bytes(4), 'hex'));
    exit when not exists (select 1 from bookings b where b.reference = v_ref);
  end loop;

  -- No payment provider is integrated: nothing has been paid yet.
  insert into bookings (
    stylist_id, service_name, service_price, customer_name, customer_email,
    customer_phone, booking_date, start_time, end_time, status, notes,
    payment_option, deposit_amount, total_price, amount_paid, paid_in_full,
    reference, manage_token_hash
  )
  values (
    v_sid, p_service_name, v_price, trim(p_customer_name), v_email,
    coalesce(trim(p_customer_phone), ''), p_date, p_start, v_end, 'confirmed', nullif(trim(p_notes), ''),
    v_option, coalesce(v_deposit, 0), v_price, 0, false,
    v_ref, encode(digest(v_token, 'sha256'), 'hex')
  )
  returning bookings.id into v_new_id;

  return query
    select b.id, b.stylist_id, b.service_name, b.service_price, b.customer_name,
           b.customer_email, b.customer_phone, b.booking_date, b.start_time,
           b.end_time, b.status, b.notes, b.created_at, b.payment_option,
           b.deposit_amount, b.total_price, b.amount_paid, b.paid_in_full,
           b.reference, v_token
    from bookings b where b.id = v_new_id;
end;
$$;

-- Returns NO ROWS (instead of raising) on a miss so failed guesses are
-- counted by the rate limiter.
create or replace function public.recover_booking(p_reference text, p_email text)
returns table (booking_id uuid, manage_token text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid;
  v_token text := encode(gen_random_bytes(32), 'hex');
begin
  perform public._rate_limit('recover_ip', public._client_ip(), 10, interval '15 minutes');
  perform public._rate_limit('recover_email', lower(trim(p_email)), 5, interval '15 minutes');

  if p_reference is null or length(p_reference) > 32 then
    return;
  end if;

  select b.id into v_id from bookings b
  where upper(b.reference) = upper(trim(p_reference))
    and b.customer_email = lower(trim(p_email))
  order by b.created_at desc
  limit 1;

  if v_id is null then
    return;
  end if;

  update bookings set manage_token_hash = encode(digest(v_token, 'sha256'), 'hex')
  where id = v_id;

  return query select v_id, v_token;
end;
$$;

create or replace function public.cancel_managed_booking(p_booking_id uuid, p_token text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if public._booking_for_token(p_booking_id, p_token) is null then
    raise exception 'unauthorized';
  end if;
  update bookings set status = 'cancelled', updated_at = now()
  where id = p_booking_id
    and status = 'confirmed'
    and (booking_date + start_time) > public._london_now();
end;
$$;

-- p_duration_mins IGNORED: the booking keeps its original length.
create or replace function public.reschedule_managed_booking(
  p_booking_id uuid, p_token text, p_new_date date, p_new_start time, p_duration_mins int
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_sid uuid;
  v_mins int;
  v_end time;
  v_slots jsonb;
begin
  select b.stylist_id, (extract(epoch from (b.end_time - b.start_time)) / 60)::int
    into v_sid, v_mins
  from bookings b
  where b.id = public._booking_for_token(p_booking_id, p_token)
    and b.status = 'confirmed'
    and (b.booking_date + b.start_time) > public._london_now();
  if v_sid is null then
    raise exception 'unauthorized';
  end if;
  if v_mins is null or v_mins <= 0 then
    v_mins := 60;
  end if;
  if p_new_date is null or p_new_start is null
     or (p_new_date + p_new_start) <= public._london_now() then
    raise exception 'slot_in_past';
  end if;
  if extract(epoch from p_new_start) / 60 + v_mins > 24 * 60 then
    raise exception 'slot_unavailable';
  end if;
  v_end := p_new_start + make_interval(mins => v_mins);

  perform pg_advisory_xact_lock(hashtextextended('booking:' || v_sid::text, 0));

  select slots into v_slots from stylist_date_availability
  where stylist_id = v_sid and date = p_new_date and is_open = true;
  if v_slots is null or not (v_slots ? to_char(p_new_start, 'HH24:MI')) then
    raise exception 'slot_unavailable';
  end if;

  if exists (
    select 1 from bookings b
    where b.stylist_id = v_sid and b.booking_date = p_new_date
      and b.id <> p_booking_id and b.status <> 'cancelled'
      and p_new_start < b.end_time and v_end > b.start_time
  ) then
    raise exception 'slot_taken';
  end if;

  update bookings
    set booking_date = p_new_date, start_time = p_new_start, end_time = v_end, updated_at = now()
  where id = p_booking_id;
end;
$$;

create or replace function public.submit_review(
  p_booking_id uuid, p_token text, p_rating int, p_comment text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_b bookings;
begin
  if public._booking_for_token(p_booking_id, p_token) is null then
    raise exception 'unauthorized';
  end if;
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'invalid_rating';
  end if;
  if length(coalesce(p_comment, '')) > 1000 then
    raise exception 'comment_too_long';
  end if;

  select * into v_b from bookings where id = p_booking_id;

  if v_b.status in ('cancelled', 'no_show') then
    raise exception 'not_eligible';
  end if;
  if v_b.status <> 'completed'
     and (v_b.booking_date + v_b.end_time) >= public._london_now() then
    raise exception 'not_eligible';
  end if;
  if exists (select 1 from reviews where booking_id = p_booking_id) then
    raise exception 'already_reviewed';
  end if;

  insert into reviews (stylist_id, reviewer_name, rating, comment, booking_id)
  values (v_b.stylist_id, v_b.customer_name, p_rating, nullif(trim(p_comment), ''), p_booking_id);
end;
$$;

create or replace function public.get_stylist_bookings(p_token text)
returns setof bookings
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_sid uuid;
begin
  select stylist_id into v_sid
  from stylist_accounts where id = public._account_id_for_token(p_token);
  if v_sid is null then
    raise exception 'unauthorized';
  end if;

  return query
    select * from bookings
    where stylist_id = v_sid
      and status <> 'cancelled'
      and booking_date >= public._london_now()::date - 14
    order by booking_date, start_time;
end;
$$;

-- ---------------------------------------------------------------------
-- 7. STORAGE — limits + no anonymous uploads
--    Uploads now go through the Next.js route /api/upload-url, which
--    verifies the session and issues a signed upload URL using the
--    SUPABASE_SERVICE_ROLE_KEY (server-side env var only).
-- ---------------------------------------------------------------------
update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where id = 'profile-images';

drop policy if exists "Public upload profile images" on storage.objects;
drop policy if exists "Public update profile images" on storage.objects;
drop policy if exists "Public delete profile images" on storage.objects;

-- ---------------------------------------------------------------------
-- 8. RLS RE-LOCK — drop every policy, re-create public SELECT only
-- ---------------------------------------------------------------------
do $$
declare
  t text;
  pol record;
  read_tables text[] := array[
    'stylists', 'stylist_specialties', 'services', 'portfolio_photos',
    'reviews', 'stylist_availability', 'blocked_times', 'stylist_date_availability'
  ];
  private_tables text[] := array[
    'bookings', 'stylist_accounts', 'stylist_sessions', 'password_reset_tokens',
    'stylist_claim_tokens', 'rate_limits'
  ];
begin
  foreach t in array (read_tables || private_tables)
  loop
    for pol in
      select policyname from pg_policies where schemaname = 'public' and tablename = t
    loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, t);
    end loop;
    execute format('alter table public.%I enable row level security', t);
  end loop;

  foreach t in array read_tables
  loop
    execute format('create policy "public read" on public.%I for select using (true)', t);
  end loop;

  foreach t in array private_tables
  loop
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- 9. FUNCTION GRANTS — deny by default, allow-list the RPCs
--    (Supabase grants EXECUTE to anon directly, so `revoke ... from
--    public` alone was NOT enough.)
-- ---------------------------------------------------------------------
revoke execute on all functions in schema public from public, anon, authenticated;
alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema public revoke execute on functions from anon, authenticated;

do $$
declare
  f text;
  allow text[] := array[
    -- auth
    'public.sign_up_stylist(text, text, text)',
    'public.sign_in_stylist(text, text)',
    'public.sign_out_stylist(text)',
    'public.get_account_by_token(text)',
    'public.reset_password_with_token(text, text)',
    'public.claim_stylist_profile(text, uuid, text)',
    -- stylist-owned writes (token checked inside)
    'public.create_stylist_profile(text, jsonb)',
    'public.update_stylist_profile(text, uuid, jsonb)',
    'public.update_stylist_deposit(text, uuid, text, numeric)',
    'public.update_availability(text, uuid, integer, boolean, jsonb)',
    'public.release_date(text, uuid, date, jsonb)',
    'public.unrelease_date(text, uuid, date)',
    'public.cancel_booking(text, uuid)',
    'public.set_booking_status(text, uuid, text)',
    'public.get_stylist_bookings(text)',
    -- public booking surface
    'public.get_taken_slots(uuid, date)',
    'public.create_booking(text, text, text, text, text, date, time without time zone, integer, text, text)',
    'public.get_managed_booking(uuid, text)',
    'public.recover_booking(text, text)',
    'public.cancel_managed_booking(uuid, text)',
    'public.reschedule_managed_booking(uuid, text, date, time without time zone, integer)',
    'public.submit_review(uuid, text, integer, text)'
  ];
begin
  foreach f in array allow
  loop
    execute format('grant execute on function %s to anon, authenticated', f);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- SELF-CHECK — aborts (rolling back nothing already committed above,
-- but loudly) if any helper/admin function is reachable by the API.
-- ---------------------------------------------------------------------
do $$
declare
  bad text;
begin
  select string_agg(p.proname, ', ') into bad
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and (p.proname like '\_%' or p.proname like 'admin\_%' or p.proname = 'pay_balance')
    and (has_function_privilege('anon', p.oid, 'execute')
         or has_function_privilege('authenticated', p.oid, 'execute'));
  if bad is not null then
    raise exception 'SECURITY CHECK FAILED — API can execute: %', bad;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'stylists' and column_name = 'claim_token'
  ) then
    raise exception 'SECURITY CHECK FAILED — stylists.claim_token still exists';
  end if;

  raise notice 'Launch hardening applied. Now run: select * from public.admin_generate_all_claim_urls();';
end;
$$;
