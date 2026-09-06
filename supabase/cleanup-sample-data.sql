-- =====================================================================
-- Remove sample/demo data and placeholder imagery.
-- Run in the Supabase SQL Editor. Safe to run more than once.
--
-- 1) Allow listings to have no photos (real photos come later, per pro).
-- 2) Delete the 8 seeded demo stylists (fixed UUIDs). Cascades remove
--    their specialties / services / portfolio / reviews.
-- 3) Blank out the placeholder Unsplash images on imported listings so
--    the app shows a clean fallback instead of stock photos.
-- =====================================================================

-- 1) Images are optional now
alter table stylists
  alter column avatar_url drop not null,
  alter column cover_image_url drop not null;

-- 2) Delete the demo stylists seeded by seed.sql
delete from stylists
where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888'
);

-- 3) Clear placeholder stock images from imported listings
update stylists
set avatar_url = null,
    cover_image_url = null
where avatar_url like 'https://images.unsplash.com/%'
   or cover_image_url like 'https://images.unsplash.com/%';
