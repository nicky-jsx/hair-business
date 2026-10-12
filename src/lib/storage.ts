import { getSupabase } from "./supabase";
import { getSessionToken } from "./session";

export const PROFILE_IMAGES_BUCKET = "profile-images";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Uploads go through a one-time signed URL from /api/upload-url, which
// verifies the stylist's session and picks the storage path server-side.
// Anonymous uploads are disabled at the storage-policy level.
export async function uploadProfileImage(
  _pathPrefix: string,
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

  const token = getSessionToken();
  if (!token) {
    return { error: "Your session has expired. Please sign in again." };
  }

  let signed: { path?: string; token?: string; publicUrl?: string; error?: string };
  try {
    const res = await fetch("/api/upload-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ kind, contentType: file.type, size: file.size }),
    });
    signed = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: signed.error || "Failed to upload image." };
    }
  } catch {
    return { error: "Network error. Please try again." };
  }

  if (!signed.path || !signed.token || !signed.publicUrl) {
    return { error: "Failed to upload image." };
  }

  const { error: uploadError } = await supabase.storage
    .from(PROFILE_IMAGES_BUCKET)
    .uploadToSignedUrl(signed.path, signed.token, file, {
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    console.error("Error uploading image:", uploadError);
    return { error: "Failed to upload image. Please try again." };
  }

  return { url: signed.publicUrl };
}
