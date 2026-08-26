-- =====================================================================
-- Directory mode fields for Hair Korter
-- Run in the Supabase SQL Editor. Idempotent.
--
-- Adds:
--   * instagram_url — a professional's Instagram (full URL or handle)
--   * verified      — whether the professional has claimed/joined. Curated
--                     (unclaimed) listings default to false, which keeps
--                     reviews + in-app booking locked in the UI.
-- =====================================================================

alter table stylists
  add column if not exists instagram_url text,
  add column if not exists verified boolean not null default false;
