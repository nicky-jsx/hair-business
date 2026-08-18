-- =====================================================================
-- Security hardening for Hair Korter  (idempotent — safe to re-run)
-- Run this ONCE in the Supabase SQL Editor, after all other migrations.
--
-- Model: the browser only ever holds the public `anon` key, so we CANNOT
-- trust anything the client sends about "who" it is. Therefore:
--   * All privileged WRITES go through SECURITY DEFINER functions that
--     verify a per-login session TOKEN and that the token's account owns
--     the row being changed.
--   * Direct table writes are removed (RLS), so the anon key can only
--     READ public catalog data and call the vetted functions.
--   * Passwords + session tokens are hashed inside Postgres; hashes never
--     reach the browser.
--
-- NOTE: pgcrypto lives in the `extensions` schema on Supabase, so every
-- function below sets `search_path = public, extensions`.
--
-- Existing accounts created with the old SHA-256 scheme must re-register.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- Account columns: password hash already exists; add session token cols.
-- ---------------------------------------------------------------------
alter table stylist_accounts
  add column if not exists session_token_hash text,
  add column if not exists session_expires_at  timestamptz;

-- Drop old function signatures so we can change their return types.
drop function if exists public.sign_up_stylist(text, text, text);
drop function if exists public.sign_in_stylist(text, text);
drop function if exists public.get_stylist_account(uuid);
drop function if exists public.get_stylist_bookings(uuid);

-- ---------------------------------------------------------------------
-- Internal helpers (not granted to anon — only called by DEFINER fns)
-- ---------------------------------------------------------------------
create or replace function public._account_id_for_token(p_token text)
returns uuid
language sql
security definer
set search_path = public, extensions
as $$
  select id
  from stylist_accounts
  where p_token is not null
    and session_token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and session_expires_at > now()
  limit 1;
$$;

create or replace function public._assert_owns(p_token text, p_stylist_id uuid)
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
  if not exists (
    select 1 from stylist_accounts
    where id = v_acc and stylist_id = p_stylist_id
  ) then
    raise exception 'forbidden';
  end if;
end;
$$;

revoke all on function public._account_id_for_token(text) from public;
revoke all on function public._assert_owns(text, uuid) from public;

-- ---------------------------------------------------------------------
-- 1. AUTHENTICATION  (bcrypt password + random session token)
-- ---------------------------------------------------------------------
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
  v_token text := encode(gen_random_bytes(32), 'hex');
begin
  if v_email is null or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email';
  end if;
  if p_password is null or length(p_password) < 8 then
    raise exception 'weak_password';
  end if;
  if v_name is null or length(v_name) = 0 or length(v_name) > 120 then
    raise exception 'invalid_name';
  end if;
  if exists (select 1 from stylist_accounts a where a.email = v_email) then
    raise exception 'email_taken';
  end if;

  insert into stylist_accounts (email, password_hash, name, session_token_hash, session_expires_at)
  values (
    v_email,
    crypt(p_password, gen_salt('bf', 12)),
    v_name,
    encode(digest(v_token, 'sha256'), 'hex'),
    now() + interval '30 days'
  )
  returning stylist_accounts.id into v_id;

  return query
    select a.id, a.email, a.name, a.stylist_id, v_token
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
  v_token text := encode(gen_random_bytes(32), 'hex');
begin
  select a.id into v_id
  from stylist_accounts a
  where a.email = v_email
    and a.password_hash = crypt(p_password, a.password_hash);

  if v_id is null then
    return;  -- no rows => invalid credentials
  end if;

  update stylist_accounts
    set session_token_hash = encode(digest(v_token, 'sha256'), 'hex'),
        session_expires_at  = now() + interval '30 days',
        updated_at = now()
  where id = v_id;

  return query
    select a.id, a.email, a.name, a.stylist_id, v_token
    from stylist_accounts a
    where a.id = v_id;
end;
$$;

-- Restore a session from a token (no id enumeration, no hashes returned).
create or replace function public.get_account_by_token(p_token text)
returns table (id uuid, email text, name text, stylist_id uuid)
language sql
security definer
set search_path = public, extensions
as $$
  select a.id, a.email, a.name, a.stylist_id
  from stylist_accounts a
  where a.id = public._account_id_for_token(p_token);
$$;

-- ---------------------------------------------------------------------
-- 2. STYLIST-OWNED WRITES  (each verifies the token owns the profile)
-- ---------------------------------------------------------------------
-- Create a profile and link it to the calling account (one-time).
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
  v_linked uuid;
  v_id uuid;
begin
  if v_acc is null then
    raise exception 'unauthorized';
  end if;

  select stylist_id into v_linked from stylist_accounts where id = v_acc;
  if v_linked is not null then
    raise exception 'already_linked';
  end if;

  insert into stylists (
    name, tagline, bio, region, years_experience, price_range,
    avatar_url, cover_image_url, featured, booking_url
  )
  values (
    left(coalesce(p_payload->>'name', ''), 120),
    left(coalesce(p_payload->>'tagline', ''), 200),
    coalesce(p_payload->>'bio', ''),
    (p_payload->>'region')::region,
    greatest(0, coalesce((p_payload->>'yearsExperience')::int, 0)),
    coalesce((p_payload->>'priceRange')::price_range, '££'),
    coalesce(nullif(p_payload->>'avatarUrl', ''),
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face'),
    coalesce(nullif(p_payload->>'coverImageUrl', ''),
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
  select v_id, s->>'name', greatest(0, coalesce((s->>'price')::int, 0)), s->>'duration'
  from jsonb_array_elements(coalesce(p_payload->'services', '[]'::jsonb)) as s;

  insert into stylist_availability (stylist_id, day_of_week, start_time, end_time, is_available)
  select v_id, d, '09:00'::time, '21:00'::time, d <> 0
  from generate_series(0, 6) as d
  on conflict (stylist_id, day_of_week) do nothing;

  update stylist_accounts
    set stylist_id = v_id, updated_at = now()
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

  update stylists set
    name             = coalesce(left(p_payload->>'name', 120), name),
    tagline          = coalesce(left(p_payload->>'tagline', 200), tagline),
    bio              = coalesce(p_payload->>'bio', bio),
    region           = coalesce((p_payload->>'region')::region, region),
    years_experience = coalesce(greatest(0, (p_payload->>'yearsExperience')::int), years_experience),
    price_range      = coalesce((p_payload->>'priceRange')::price_range, price_range),
    booking_url      = case when p_payload ? 'bookingUrl'
                            then nullif(p_payload->>'bookingUrl', '') else booking_url end,
    avatar_url       = coalesce(nullif(p_payload->>'avatarUrl', ''), avatar_url),
    cover_image_url  = coalesce(nullif(p_payload->>'coverImageUrl', ''), cover_image_url),
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
    select p_stylist_id, s->>'name', greatest(0, coalesce((s->>'price')::int, 0)), s->>'duration'
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
                      when p_type = 'percentage' then least(100, greatest(0, p_value))
                      else greatest(0, p_value)
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

  insert into stylist_date_availability (stylist_id, date, slots, is_open, updated_at)
  values (p_stylist_id, p_date, coalesce(p_slots, '[]'::jsonb), true, now())
  on conflict (stylist_id, date) do update
    set slots = excluded.slots, is_open = true, updated_at = now();
end;
$$;

create or replace function public.unrelease_date(
  p_token text,
  p_stylist_id uuid,
  p_date date
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  perform public._assert_owns(p_token, p_stylist_id);
  delete from stylist_date_availability
  where stylist_id = p_stylist_id and date = p_date;
end;
$$;

create or replace function public.cancel_booking(
  p_token text,
  p_booking_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_acc uuid := public._account_id_for_token(p_token);
  v_sid uuid;
begin
  if v_acc is null then
    raise exception 'unauthorized';
  end if;
  select stylist_id into v_sid from bookings where id = p_booking_id;
  if v_sid is null then
    raise exception 'not_found';
  end if;
  if not exists (select 1 from stylist_accounts where id = v_acc and stylist_id = v_sid) then
    raise exception 'forbidden';
  end if;

  update bookings set status = 'cancelled', updated_at = now()
  where id = p_booking_id;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. BOOKINGS  (customers are anonymous — validate everything in the DB)
-- ---------------------------------------------------------------------
-- Times only (no PII) so the public page can grey out taken slots.
create or replace function public.get_taken_slots(
  p_stylist_id uuid,
  p_date date
)
returns table (start_time time, end_time time)
language sql
security definer
set search_path = public, extensions
as $$
  select b.start_time, b.end_time
  from bookings b
  where b.stylist_id = p_stylist_id
    and b.booking_date = p_date
    and b.status <> 'cancelled';
$$;

-- Owner-scoped dashboard bookings — derived from the token, NOT a
-- client-supplied stylist id, so no one can read another stylist's list.
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
      and booking_date >= current_date
      and status <> 'cancelled'
    order by booking_date, start_time;
end;
$$;

-- Create a booking. Price + deposit are computed from the DB, never
-- trusted from the client, and the slot must be released and free.
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
returns setof bookings
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_sid uuid := p_stylist_id::uuid;
  v_price int;
  v_dep_type text;
  v_dep_val numeric;
  v_deposit int;
  v_end time;
  v_slots jsonb;
begin
  -- input validation
  if coalesce(trim(p_customer_name), '') = '' or length(p_customer_name) > 120 then
    raise exception 'invalid_customer';
  end if;
  if p_customer_email is null or p_customer_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email';
  end if;
  if coalesce(p_duration_mins, 0) <= 0 or p_duration_mins > 1440 then
    raise exception 'invalid_duration';
  end if;

  -- price comes from the catalog, not the client
  select price into v_price
  from services
  where stylist_id = v_sid and name = p_service_name
  order by price
  limit 1;
  if v_price is null then
    raise exception 'invalid_service';
  end if;

  v_end := p_start + make_interval(mins => p_duration_mins);

  -- the date must be released and offer this exact slot
  select slots into v_slots
  from stylist_date_availability
  where stylist_id = v_sid and date = p_date and is_open = true;
  if v_slots is null or not (v_slots ? to_char(p_start, 'HH24:MI')) then
    raise exception 'slot_unavailable';
  end if;

  -- no overlap with an existing non-cancelled booking
  if exists (
    select 1 from bookings b
    where b.stylist_id = v_sid and b.booking_date = p_date
      and b.status <> 'cancelled'
      and p_start < b.end_time and v_end > b.start_time
  ) then
    raise exception 'slot_taken';
  end if;

  -- deposit computed from the stylist's own settings
  select deposit_type, deposit_value into v_dep_type, v_dep_val
  from stylists where id = v_sid;

  if p_payment_option = 'deposit' and v_dep_type in ('percentage', 'fixed') and coalesce(v_dep_val, 0) > 0 then
    v_deposit := case
                   when v_dep_type = 'percentage' then round(v_price * v_dep_val / 100.0)
                   else least(v_dep_val, v_price)
                 end;
  else
    v_deposit := 0;
  end if;

  return query
  with ins as (
    insert into bookings (
      stylist_id, service_name, service_price, customer_name, customer_email,
      customer_phone, booking_date, start_time, end_time, status, notes,
      payment_option, deposit_amount, total_price
    )
    values (
      v_sid, p_service_name, v_price, trim(p_customer_name), lower(trim(p_customer_email)),
      p_customer_phone, p_date, p_start, v_end, 'confirmed', p_notes,
      case when p_payment_option = 'deposit' then 'deposit' else 'full' end,
      coalesce(v_deposit, 0), v_price
    )
    returning *
  )
  select * from ins;
end;
$$;

-- ---------------------------------------------------------------------
-- 4. STORAGE — no overwriting other people's images
-- ---------------------------------------------------------------------
drop policy if exists "Public update profile images" on storage.objects;

-- ---------------------------------------------------------------------
-- 5. INPUT VALIDATION — DB CHECK constraints (defense in depth)
-- ---------------------------------------------------------------------
alter table bookings drop constraint if exists bookings_amounts_chk;
alter table bookings add constraint bookings_amounts_chk
  check (
    coalesce(deposit_amount, 0) >= 0
    and coalesce(total_price, 0) >= 0
    and coalesce(deposit_amount, 0) <= coalesce(total_price, deposit_amount, 0)
  ) not valid;

alter table services drop constraint if exists services_price_chk;
alter table services add constraint services_price_chk check (price >= 0) not valid;

alter table stylists drop constraint if exists stylists_deposit_value_chk;
alter table stylists add constraint stylists_deposit_value_chk
  check (deposit_value >= 0 and (deposit_type <> 'percentage' or deposit_value <= 100)) not valid;

-- ---------------------------------------------------------------------
-- 6. LOCK DOWN RLS — drop ALL existing policies on these tables, then
--    re-create ONLY public SELECT where the app needs to read directly.
--    Every write now goes through the DEFINER functions above.
-- ---------------------------------------------------------------------
do $$
declare
  t text;
  pol record;
  read_tables text[] := array[
    'stylists', 'stylist_specialties', 'services', 'portfolio_photos',
    'reviews', 'stylist_availability', 'blocked_times', 'stylist_date_availability'
  ];
  no_access_tables text[] := array['bookings', 'stylist_accounts'];
begin
  foreach t in array (read_tables || no_access_tables)
  loop
    for pol in
      select policyname from pg_policies where schemaname = 'public' and tablename = t
    loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, t);
    end loop;
    execute format('alter table public.%I enable row level security', t);
  end loop;

  -- public read-only access for catalog / availability tables
  foreach t in array read_tables
  loop
    execute format('create policy "public read" on public.%I for select using (true)', t);
  end loop;
  -- bookings + stylist_accounts get NO policies => no direct anon access.
end;
$$;

-- ---------------------------------------------------------------------
-- 7. GRANTS — expose only the vetted functions to the anon key.
-- ---------------------------------------------------------------------
revoke all on function public.sign_up_stylist(text, text, text) from public;
revoke all on function public.sign_in_stylist(text, text) from public;
revoke all on function public.get_account_by_token(text) from public;
revoke all on function public.create_stylist_profile(text, jsonb) from public;
revoke all on function public.update_stylist_profile(text, uuid, jsonb) from public;
revoke all on function public.update_stylist_deposit(text, uuid, text, numeric) from public;
revoke all on function public.update_availability(text, uuid, int, boolean, jsonb) from public;
revoke all on function public.release_date(text, uuid, date, jsonb) from public;
revoke all on function public.unrelease_date(text, uuid, date) from public;
revoke all on function public.cancel_booking(text, uuid) from public;
revoke all on function public.get_taken_slots(uuid, date) from public;
revoke all on function public.get_stylist_bookings(text) from public;
revoke all on function public.create_booking(text, text, text, text, text, date, time, int, text, text) from public;

grant execute on function public.sign_up_stylist(text, text, text) to anon, authenticated;
grant execute on function public.sign_in_stylist(text, text) to anon, authenticated;
grant execute on function public.get_account_by_token(text) to anon, authenticated;
grant execute on function public.create_stylist_profile(text, jsonb) to anon, authenticated;
grant execute on function public.update_stylist_profile(text, uuid, jsonb) to anon, authenticated;
grant execute on function public.update_stylist_deposit(text, uuid, text, numeric) to anon, authenticated;
grant execute on function public.update_availability(text, uuid, int, boolean, jsonb) to anon, authenticated;
grant execute on function public.release_date(text, uuid, date, jsonb) to anon, authenticated;
grant execute on function public.unrelease_date(text, uuid, date) to anon, authenticated;
grant execute on function public.cancel_booking(text, uuid) to anon, authenticated;
grant execute on function public.get_taken_slots(uuid, date) to anon, authenticated;
grant execute on function public.get_stylist_bookings(text) to anon, authenticated;
grant execute on function public.create_booking(text, text, text, text, text, date, time, int, text, text) to anon, authenticated;
