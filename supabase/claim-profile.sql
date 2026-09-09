-- =====================================================================
-- Hair Korter — Claim Profile RPC
-- Run in Supabase SQL Editor.
--
-- Allows an authenticated stylist account to claim an existing curated
-- directory profile (by stylist_id), linking the profile to the account
-- and unlocking verified status.
-- =====================================================================

create or replace function public.claim_stylist_profile(
  p_token text,
  p_stylist_id uuid
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
begin
  if v_acc is null then
    raise exception 'unauthorized';
  end if;

  -- Check if caller already has a linked stylist profile
  select stylist_id into v_already_linked from stylist_accounts where id = v_acc;
  if v_already_linked is not null then
    raise exception 'already_linked';
  end if;

  -- Verify the target stylist exists
  if not exists (select 1 from stylists where id = p_stylist_id) then
    raise exception 'stylist_not_found';
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

  -- Mark stylist as verified
  update stylists
    set verified = true
    where id = p_stylist_id;
end;
$$;

revoke all on function public.claim_stylist_profile(text, uuid) from public;
grant execute on function public.claim_stylist_profile(text, uuid) to anon, authenticated;
