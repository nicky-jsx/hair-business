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

-- 4) Allow overwrites/upserts
DROP POLICY IF EXISTS "Public update profile images" ON storage.objects;
CREATE POLICY "Public update profile images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'profile-images')
  WITH CHECK (bucket_id = 'profile-images');
