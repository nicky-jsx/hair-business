-- =====================================================================
-- Booking management + verified reviews for Hair Korter
-- Run in the Supabase SQL Editor AFTER security-hardening.sql.
-- Idempotent.
--
-- Customers have no accounts, so each booking gets:
--   * a short human REFERENCE (shown on the confirmation), and
--   * a strong MANAGE TOKEN (kept in a link saved to their browser).
-- Management RPCs require the manage token; if the customer lost the link
-- they recover it with reference + email (which rotates the token).
--
-- Reviews are tied to a booking and can only be left by the real customer
-- (proven by the manage token), once the appointment is completed OR its
-- end time has passed (customer protection). Stylists can mark No-show to
-- block a dishonest review, but can never post or delete reviews.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- Columns
-- ---------------------------------------------------------------------
alter table bookings
  add column if not exists reference text,
  add column if not exists manage_token_hash text,
  add column if not exists amount_paid integer not null default 0,
  add column if not exists paid_in_full boolean not null default false;

-- allow a 'no_show' status
alter table bookings drop constraint if exists bookings_status_check;
alter table bookings add constraint bookings_status_check
  check (status in ('confirmed', 'cancelled', 'completed', 'no_show'));

alter table reviews
  add column if not exists booking_id uuid references bookings(id) on delete set null;
create unique index if not exists uniq_reviews_booking
  on reviews(booking_id) where booking_id is not null;

-- ---------------------------------------------------------------------
-- Helper: resolve a booking id from its manage token
-- ---------------------------------------------------------------------
create or replace function public._booking_for_token(p_booking_id uuid, p_token text)
returns uuid
language sql
security definer
set search_path = public, extensions
as $$
  select id from bookings
  where id = p_booking_id
    and p_token is not null
    and manage_token_hash = encode(digest(p_token, 'sha256'), 'hex')
  limit 1;
$$;
revoke all on function public._booking_for_token(uuid, text) from public;

-- ---------------------------------------------------------------------
-- create_booking — now also mints a reference + manage token
-- ---------------------------------------------------------------------
drop function if exists public.create_booking(text, text, text, text, text, date, time, int, text, text);

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
  v_price int;
  v_dep_type text;
  v_dep_val numeric;
  v_deposit int;
  v_end time;
  v_slots jsonb;
  v_ref text := upper(encode(gen_random_bytes(3), 'hex'));
  v_token text := encode(gen_random_bytes(32), 'hex');
  v_paid int;
  v_option text := case when p_payment_option = 'deposit' then 'deposit' else 'full' end;
  v_new_id uuid;
begin
  if coalesce(trim(p_customer_name), '') = '' or length(p_customer_name) > 120 then
    raise exception 'invalid_customer';
  end if;
  if p_customer_email is null or p_customer_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email';
  end if;
  if coalesce(p_duration_mins, 0) <= 0 or p_duration_mins > 1440 then
    raise exception 'invalid_duration';
  end if;

  select price into v_price
  from services where stylist_id = v_sid and name = p_service_name
  order by price limit 1;
  if v_price is null then raise exception 'invalid_service'; end if;

  v_end := p_start + make_interval(mins => p_duration_mins);

  select slots into v_slots from stylist_date_availability
  where stylist_id = v_sid and date = p_date and is_open = true;
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

  select deposit_type, deposit_value into v_dep_type, v_dep_val
  from stylists where id = v_sid;

  if v_option = 'deposit' and v_dep_type in ('percentage', 'fixed') and coalesce(v_dep_val, 0) > 0 then
    v_deposit := case when v_dep_type = 'percentage'
                      then round(v_price * v_dep_val / 100.0)
                      else least(v_dep_val, v_price) end;
  else
    v_deposit := 0;
    v_option := 'full';
  end if;

  v_paid := case when v_option = 'deposit' then coalesce(v_deposit, 0) else v_price end;

  insert into bookings (
    stylist_id, service_name, service_price, customer_name, customer_email,
    customer_phone, booking_date, start_time, end_time, status, notes,
    payment_option, deposit_amount, total_price, amount_paid, paid_in_full,
    reference, manage_token_hash
  )
  values (
    v_sid, p_service_name, v_price, trim(p_customer_name), lower(trim(p_customer_email)),
    p_customer_phone, p_date, p_start, v_end, 'confirmed', p_notes,
    v_option, coalesce(v_deposit, 0), v_price, v_paid, (v_option = 'full'),
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

-- ---------------------------------------------------------------------
-- Customer: load a booking with the manage token
-- ---------------------------------------------------------------------
create or replace function public.get_managed_booking(p_booking_id uuid, p_token text)
returns setof bookings
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if public._booking_for_token(p_booking_id, p_token) is null then
    raise exception 'unauthorized';
  end if;
  return query select * from bookings where id = p_booking_id;
end;
$$;

-- Customer: recover access with reference + email (rotates the token)
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
  select id into v_id from bookings
  where upper(reference) = upper(trim(p_reference))
    and customer_email = lower(trim(p_email))
  order by created_at desc
  limit 1;

  if v_id is null then
    raise exception 'not_found';
  end if;

  update bookings set manage_token_hash = encode(digest(v_token, 'sha256'), 'hex')
  where id = v_id;

  return query select v_id, v_token;
end;
$$;

-- Customer: cancel
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
  where id = p_booking_id and status = 'confirmed';
end;
$$;

-- Customer: reschedule to a new released + free slot
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
  v_end time;
  v_slots jsonb;
begin
  select stylist_id into v_sid from bookings
  where id = public._booking_for_token(p_booking_id, p_token) and status = 'confirmed';
  if v_sid is null then raise exception 'unauthorized'; end if;
  if coalesce(p_duration_mins, 0) <= 0 or p_duration_mins > 1440 then
    raise exception 'invalid_duration';
  end if;

  v_end := p_new_start + make_interval(mins => p_duration_mins);

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

-- Customer: pay the outstanding balance (placeholder — records as paid, no charge)
create or replace function public.pay_balance(p_booking_id uuid, p_token text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if public._booking_for_token(p_booking_id, p_token) is null then
    raise exception 'unauthorized';
  end if;
  update bookings
    set amount_paid = total_price, paid_in_full = true,
        payment_option = 'full', updated_at = now()
  where id = p_booking_id and status <> 'cancelled';
end;
$$;

-- Customer: leave a review (verified, one per booking)
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

  select * into v_b from bookings where id = p_booking_id;

  if v_b.status in ('cancelled', 'no_show') then
    raise exception 'not_eligible';
  end if;
  -- must be completed OR the appointment must already be over
  if v_b.status <> 'completed'
     and (v_b.booking_date + v_b.end_time) >= now()::timestamp then
    raise exception 'not_eligible';
  end if;

  if exists (select 1 from reviews where booking_id = p_booking_id) then
    raise exception 'already_reviewed';
  end if;

  insert into reviews (stylist_id, reviewer_name, rating, comment, booking_id)
  values (v_b.stylist_id, v_b.customer_name, p_rating, nullif(trim(p_comment), ''), p_booking_id);
end;
$$;

-- ---------------------------------------------------------------------
-- Stylist (session-authenticated): mark completed / no-show
-- ---------------------------------------------------------------------
create or replace function public.set_booking_status(
  p_token text, p_booking_id uuid, p_status text
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
  if v_acc is null then raise exception 'unauthorized'; end if;
  if p_status not in ('completed', 'no_show', 'confirmed') then
    raise exception 'invalid_status';
  end if;
  select stylist_id into v_sid from bookings where id = p_booking_id;
  if v_sid is null then raise exception 'not_found'; end if;
  if not exists (select 1 from stylist_accounts where id = v_acc and stylist_id = v_sid) then
    raise exception 'forbidden';
  end if;

  update bookings set status = p_status, updated_at = now()
  where id = p_booking_id and status <> 'cancelled';
end;
$$;

-- ---------------------------------------------------------------------
-- Dashboard list: include recent past so stylists can mark completed
-- ---------------------------------------------------------------------
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
  if v_sid is null then raise exception 'unauthorized'; end if;

  return query
    select * from bookings
    where stylist_id = v_sid
      and status <> 'cancelled'
      and booking_date >= current_date - interval '14 days'
    order by booking_date, start_time;
end;
$$;

-- ---------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------
revoke all on function public.create_booking(text, text, text, text, text, date, time, int, text, text) from public;
revoke all on function public.get_managed_booking(uuid, text) from public;
revoke all on function public.recover_booking(text, text) from public;
revoke all on function public.cancel_managed_booking(uuid, text) from public;
revoke all on function public.reschedule_managed_booking(uuid, text, date, time, int) from public;
revoke all on function public.pay_balance(uuid, text) from public;
revoke all on function public.submit_review(uuid, text, int, text) from public;
revoke all on function public.set_booking_status(text, uuid, text) from public;
revoke all on function public.get_stylist_bookings(text) from public;

grant execute on function public.create_booking(text, text, text, text, text, date, time, int, text, text) to anon, authenticated;
grant execute on function public.get_managed_booking(uuid, text) to anon, authenticated;
grant execute on function public.recover_booking(text, text) to anon, authenticated;
grant execute on function public.cancel_managed_booking(uuid, text) to anon, authenticated;
grant execute on function public.reschedule_managed_booking(uuid, text, date, time, int) to anon, authenticated;
grant execute on function public.pay_balance(uuid, text) to anon, authenticated;
grant execute on function public.submit_review(uuid, text, int, text) to anon, authenticated;
grant execute on function public.set_booking_status(text, uuid, text) to anon, authenticated;
grant execute on function public.get_stylist_bookings(text) to anon, authenticated;
