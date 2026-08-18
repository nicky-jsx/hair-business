-- Storage bucket for stylist profile photos & banners (Hair Korter)
-- Run once in your Supabase SQL Editor.

-- 1) Create a public bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2) Allow anyone to read images (bucket is public)
DROP POLICY IF EXISTS "Public read profile images" ON storage.objects;
CREATE POLICY "Public read profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

-- 3) Allow uploads to the bucket
DROP POLICY IF EXISTS "Public upload profile images" ON storage.objects;
CREATE POLICY "Public upload profile images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-images');

-- 4) Do NOT allow overwrites. The app uploads to unique, timestamped
--    paths, so overwriting is unnecessary — and allowing it would let
--    anyone replace another stylist's photo. Drop any such policy.
DROP POLICY IF EXISTS "Public update profile images" ON storage.objects;
