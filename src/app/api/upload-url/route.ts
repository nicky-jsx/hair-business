import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Issues a one-time signed upload URL for a stylist's avatar/cover image.
// Anonymous uploads are disabled at the storage-policy level, so this route
// is the only way in: it verifies the caller's session token first and
// chooses the storage path itself (the client can't pick where to write).
//
// Requires SUPABASE_SERVICE_ROLE_KEY as a SERVER-ONLY env var (never prefix
// it with NEXT_PUBLIC_).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "profile-images";
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) {
    return fail(503, "Image uploads are not configured yet.");
  }

  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token || token.length > 128) {
    return fail(401, "Your session has expired. Please sign in again.");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body = (await req.json().catch(() => null)) as any;
  const kind = body?.kind;
  const contentType = body?.contentType;
  const size = Number(body?.size);
  if (kind !== "avatar" && kind !== "cover") return fail(400, "Invalid image type.");
  if (typeof contentType !== "string" || !EXT_BY_TYPE[contentType]) {
    return fail(400, "Please choose a JPG, PNG, WEBP or GIF image.");
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_SIZE_BYTES) {
    return fail(400, "Image must be under 5 MB.");
  }

  // Verify the session via the same RPC the app uses.
  const anon = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await anon.rpc("get_account_by_token", { p_token: token });
  const account = Array.isArray(data) ? data[0] : data;
  if (error || !account?.id) {
    return fail(401, "Your session has expired. Please sign in again.");
  }

  const path = `${account.id}/${kind}-${Date.now()}-${crypto.randomUUID()}.${EXT_BY_TYPE[contentType]}`;

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: signed, error: signError } = await admin.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);
  if (signError || !signed) {
    console.error("createSignedUploadUrl failed:", signError?.message);
    return fail(500, "Couldn't start the upload. Please try again.");
  }

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ path, token: signed.token, publicUrl: pub.publicUrl });
}
