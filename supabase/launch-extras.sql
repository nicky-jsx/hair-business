-- =====================================================================
-- SP Korter — LAUNCH EXTRAS  (idempotent — safe to re-run)
--
-- Run in the Supabase SQL Editor AFTER launch-hardening.sql.
--
-- Adds:
--   1. takedown_requests  — the /takedown page (removal, copyright,
--      "report this profile") now stores requests here instead of
--      silently discarding them. Read them in the SQL Editor:
--        select * from takedown_requests order by created_at desc;
--   2. delete_my_account  — lets a stylist permanently delete their own
--      account (and linked profile) from inside the app. Required by
--      UK GDPR (right to erasure) and by Apple/Google store rules.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- 1. TAKEDOWN / REPORT REQUESTS
-- ---------------------------------------------------------------------
create table if not exists public.takedown_requests (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  business_name  text not null,
  requester_name text not null,
  email          text not null,
  reason         text not null,
  details        text,
  profile_id     uuid,
  status         text not null default 'new'   -- new | actioned | rejected
);
alter table public.takedown_requests enable row level security;
revoke all on public.takedown_requests from anon, authenticated;

create or replace function public.submit_takedown_request(
  p_business_name  text,
  p_requester_name text,
  p_email          text,
  p_reason         text,
  p_details        text default null,
  p_profile_id     uuid default null
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_email text := lower(trim(p_email));
begin
  perform public._rate_limit('takedown_ip', public._client_ip(), 5, interval '1 hour');
  perform public._rate_limit('takedown_all', 'global', 200, interval '1 day');

  if p_business_name is null or length(trim(p_business_name)) = 0
     or length(p_business_name) > 200 then
    raise exception 'invalid_business';
  end if;
  if p_requester_name is null or length(trim(p_requester_name)) = 0
     or length(p_requester_name) > 120 then
    raise exception 'invalid_name';
  end if;
  if v_email is null or length(v_email) > 254
     or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email';
  end if;
  if p_reason is null
     or p_reason not in ('owner_removal', 'copyright', 'inaccurate_data', 'report', 'other') then
    raise exception 'invalid_reason';
  end if;
  if length(coalesce(p_details, '')) > 3000 then
    raise exception 'details_too_long';
  end if;

  insert into takedown_requests
    (business_name, requester_name, email, reason, details, profile_id)
  values
    (trim(p_business_name), trim(p_requester_name), v_email, p_reason,
     nullif(trim(coalesce(p_details, '')), ''), p_profile_id);
end;
$$;

-- ---------------------------------------------------------------------
-- 2. SELF-SERVICE ACCOUNT DELETION
--    Deletes the account, all its sessions/reset links and — if the
--    account owns a profile — the profile (services, portfolio, reviews,
--    availability). Refuses while upcoming confirmed bookings exist so
--    customers are never silently left stranded.
-- ---------------------------------------------------------------------
create or replace function public.delete_my_account(p_token text)
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
  perform public._rate_limit('delete_acc', v_acc::text, 5, interval '1 hour');

  select stylist_id into v_sid from stylist_accounts where id = v_acc;

  if v_sid is not null then
    if exists (
      select 1 from bookings b
      where b.stylist_id = v_sid
        and b.status = 'confirmed'
        and (b.booking_date + b.end_time) >= public._london_now()
    ) then
      raise exception 'has_upcoming_bookings';
    end if;

    -- cascades to services, portfolio, specialties, availability,
    -- reviews, bookings, claim token
    delete from stylists where id = v_sid;
  end if;

  -- cascades to stylist_sessions and password_reset_tokens
  delete from stylist_accounts where id = v_acc;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. GRANTS  (launch-hardening.sql revokes everything by default)
-- ---------------------------------------------------------------------
revoke all on function public.submit_takedown_request(text, text, text, text, text, uuid)
  from public, anon, authenticated;
revoke all on function public.delete_my_account(text)
  from public, anon, authenticated;

grant execute on function public.submit_takedown_request(text, text, text, text, text, uuid)
  to anon, authenticated;
grant execute on function public.delete_my_account(text)
  to anon, authenticated;

do $$
begin
  if has_table_privilege('anon', 'public.takedown_requests', 'select')
     or has_table_privilege('anon', 'public.takedown_requests', 'insert') then
    raise exception 'SECURITY CHECK FAILED — takedown_requests is reachable by the API';
  end if;
  raise notice 'Launch extras applied.';
end;
$$;
