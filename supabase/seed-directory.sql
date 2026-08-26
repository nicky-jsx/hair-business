-- =====================================================================
-- Hair Korter — directory listing template
-- Run in the Supabase SQL Editor (after schema.sql + directory-fields.sql).
--
-- Each professional is ONE self-contained block. To add someone:
--   1. Copy the "TEMPLATE" block at the bottom.
--   2. Fill in their details.
--   3. Paste it above this line and run.
-- Postgres generates the id and links specialties/services/photos for you.
--
-- Field notes:
--   region        : 'North' | 'East' | 'South' | 'West'
--   price_range   : '£' | '££' | '£££'
--   featured      : true = show in the featured row on the home page
--   verified      : keep FALSE for curated (unclaimed) listings — this keeps
--                   reviews + in-app booking locked until they join.
--   booking_url   : their external booking page (or null)
--   instagram_url : full URL or a handle like '@jane' (or null)
--   specialty     : 'Braids' | 'Locs' | 'Natural Hair' | 'Silk Press' |
--                   'Color' | 'Cuts' | 'Extensions' | 'Wigs' | 'Eyelashes'
-- =====================================================================

-- ---------------------------------------------------------------------
-- EXAMPLE (filled in) — safe to delete once you get the idea
-- ---------------------------------------------------------------------
do $$
declare
  v_id uuid;
begin
  insert into stylists (
    name, tagline, bio, avatar_url, cover_image_url, region,
    years_experience, price_range, featured, booking_url, instagram_url, verified
  ) values (
    'Jane Doe',
    'Knotless braids & protective styles',
    'North London braider specialising in neat, long-lasting knotless braids and scalp-friendly protective styles.',
    'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=400&fit=crop',
    'North',            -- region
    6,                  -- years_experience
    '££',               -- price_range
    true,               -- featured
    'https://jane-braids.setmore.com',   -- booking_url (or null)
    '@jane.braids',                       -- instagram_url (or null)
    false               -- verified
  )
  returning id into v_id;

  insert into stylist_specialties (stylist_id, specialty) values
    (v_id, 'Braids'),
    (v_id, 'Natural Hair');

  insert into services (stylist_id, name, price, duration) values
    (v_id, 'Knotless Braids (medium)', 120, '4–5 hrs'),
    (v_id, 'Cornrows', 55, '1.5 hrs');

  insert into portfolio_photos (stylist_id, photo_url, sort_order) values
    (v_id, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop', 0),
    (v_id, 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=600&fit=crop', 1);
end $$;


-- ---------------------------------------------------------------------
-- TEMPLATE — copy this block for each new professional
-- ---------------------------------------------------------------------
/*
do $$
declare
  v_id uuid;
begin
  insert into stylists (
    name, tagline, bio, avatar_url, cover_image_url, region,
    years_experience, price_range, featured, booking_url, instagram_url, verified
  ) values (
    'FULL NAME',
    'SHORT TAGLINE',
    'ONE OR TWO SENTENCE BIO',
    'AVATAR_IMAGE_URL',
    'COVER_IMAGE_URL',
    'North',            -- region: North | East | South | West
    5,                  -- years_experience
    '££',               -- price_range: £ | ££ | £££
    false,              -- featured
    null,               -- booking_url (external booking page or null)
    null,               -- instagram_url (e.g. '@handle' or full URL, or null)
    false               -- verified (keep false for curated listings)
  )
  returning id into v_id;

  -- Specialties (one row each; remove/add lines as needed)
  insert into stylist_specialties (stylist_id, specialty) values
    (v_id, 'Braids');

  -- Services (name, price in £, duration text)
  insert into services (stylist_id, name, price, duration) values
    (v_id, 'SERVICE NAME', 60, '2 hrs');

  -- Portfolio photos (url, sort_order starting at 0) — optional
  insert into portfolio_photos (stylist_id, photo_url, sort_order) values
    (v_id, 'PHOTO_URL', 0);
end $$;
*/
