import { getSupabase } from "./supabase";

export const PROFILE_IMAGES_BUCKET = "profile-images";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function uploadProfileImage(
  pathPrefix: string,
  file: File,
  kind: "avatar" | "cover"
): Promise<{ url?: string; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: "Database not configured." };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Please choose a JPG, PNG, WEBP or GIF image." };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { error: "Image must be under 5 MB." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  // Unique path (timestamp + random) so uploads never collide and we never
  // need to overwrite an existing object — overwrites are disabled at the
  // storage-policy level to stop anyone replacing someone else's image.
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `${pathPrefix}/${kind}-${unique}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(PROFILE_IMAGES_BUCKET)
    .upload(path, file, { upsert: false, cacheControl: "3600" });

  if (uploadError) {
    console.error("Error uploading image:", uploadError);
    return {
      error:
        uploadError.message ||
        "Failed to upload image. Make sure the storage bucket exists.",
    };
  }

  const { data } = supabase.storage
    .from(PROFILE_IMAGES_BUCKET)
    .getPublicUrl(path);

  return { url: data.publicUrl };
}
