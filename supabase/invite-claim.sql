-- =====================================================================
-- Hair Korter — Invite-Only Claim System
-- Run in Supabase SQL Editor AFTER security-hardening.sql
--
-- Adds a per-stylist invite token so that only people who receive the
-- unique link from you can claim a profile. The public claim search
-- is removed from the frontend.
-- =====================================================================

-- 1. Add an invite_token column to stylists (one per listing).
--    Pre-populated with a random 32-char hex string for every existing row.
alter table stylists
  add column if not exists claim_token text;

-- Generate tokens for all existing stylists that don't have one yet.
update stylists
set claim_token = encode(gen_random_bytes(16), 'hex')
where claim_token is null;

-- Make it non-nullable going forward (new inserts will set it).
-- We also add a unique constraint so no two stylists share a token.
alter table stylists
  alter column claim_token set default encode(gen_random_bytes(16), 'hex');

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'stylists_claim_token_key'
  ) then
    alter table stylists add constraint stylists_claim_token_key unique (claim_token);
  end if;
end;
$$;

-- 2. Replace the claim_stylist_profile function to require the invite token.
create or replace function public.claim_stylist_profile(
  p_token text,          -- session token (proves caller is logged in)
  p_stylist_id uuid,     -- which profile to claim
  p_claim_token text default null  -- the invite secret from the URL
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_acc uuid := public._account_id_for_token(p_token);
  v_already_linked uuid;
  v_stylist_owner uuid;
  v_stored_claim_token text;
begin
  if v_acc is null then
    raise exception 'unauthorized';
  end if;

  -- Check if caller already has a linked stylist profile
  select stylist_id into v_already_linked from stylist_accounts where id = v_acc;
  if v_already_linked is not null then
    raise exception 'already_linked';
  end if;

  -- Verify the target stylist exists and get its claim token
  select claim_token into v_stored_claim_token from stylists where id = p_stylist_id;
  if v_stored_claim_token is null then
    raise exception 'stylist_not_found';
  end if;

  -- Verify the invite token matches
  if p_claim_token is null or p_claim_token <> v_stored_claim_token then
    raise exception 'invalid_claim_token';
  end if;

  -- Check if stylist is already claimed by someone else
  select id into v_stylist_owner from stylist_accounts where stylist_id = p_stylist_id;
  if v_stylist_owner is not null and v_stylist_owner <> v_acc then
    raise exception 'profile_already_claimed';
  end if;

  -- Link profile to this account
  update stylist_accounts
    set stylist_id = p_stylist_id,
        updated_at = now()
    where id = v_acc;

  -- Mark stylist as verified and clear the claim token (one-time use)
  update stylists
    set verified = true,
        claim_token = null
    where id = p_stylist_id;
end;
$$;

revoke all on function public.claim_stylist_profile(text, uuid, text) from public;
grant execute on function public.claim_stylist_profile(text, uuid, text) to anon, authenticated;

-- 3. Helper: Admin function to generate a claim URL for a stylist.
--    Call from SQL Editor: SELECT generate_claim_url('stylist-uuid-here');
create or replace function public.generate_claim_url(p_stylist_id uuid)
returns text
language sql
security definer
set search_path = public, extensions
as $$
  select
    'https://hair-business-pied.vercel.app/stylist/claim?id='
    || p_stylist_id::text
    || '&token='
    || coalesce(claim_token, 'ALREADY_CLAIMED')
  from stylists
  where id = p_stylist_id;
$$;

-- 4. Bulk generate all claim URLs (run in SQL Editor to get all links).
--    SELECT * FROM generate_all_claim_urls();
create or replace function public.generate_all_claim_urls()
returns table (stylist_name text, claim_url text, already_claimed boolean)
language sql
security definer
set search_path = public, extensions
as $$
  select
    s.name,
    'https://hair-business-pied.vercel.app/stylist/claim?id='
      || s.id::text
      || '&token='
      || coalesce(s.claim_token, ''),
    s.claim_token is null as already_claimed
  from stylists s
  order by s.name;
$$;
