-- Storage bucket for stylist profile photos & banners (SP Korter)
-- Run once in your Supabase SQL Editor.

-- 1) Create a public (read-only) bucket with size + type limits
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profile-images', 'profile-images', true, 5242880,
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE
  SET file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2) Allow anyone to read images (bucket is public)
DROP POLICY IF EXISTS "Public read profile images" ON storage.objects;
CREATE POLICY "Public read profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

-- 3) NO anonymous uploads/updates/deletes. Uploads use signed upload URLs
--    issued by the Next.js route /api/upload-url after verifying the
--    stylist's session (needs SUPABASE_SERVICE_ROLE_KEY on the server).
DROP POLICY IF EXISTS "Public upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public update profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public delete profile images" ON storage.objects;
