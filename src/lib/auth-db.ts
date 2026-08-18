import { getSupabase } from "./supabase";
import { setSessionToken, getSessionToken } from "./session";

interface StylistAccount {
  id: string;
  email: string;
  name: string;
  stylistId: string | null;
}

interface SignUpData {
  email: string;
  password: string;
  name: string;
}

interface SignInData {
  email: string;
  password: string;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAccountRow(row: any): StylistAccount {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    stylistId: row.stylist_id ?? null,
  };
}

// Map raw Postgres exception messages to friendly copy.
function friendlyAuthError(message?: string): string {
  if (!message) return "Something went wrong. Please try again.";
  if (message.includes("email_taken"))
    return "An account with this email already exists";
  if (message.includes("weak_password"))
    return "Password must be at least 8 characters";
  if (message.includes("invalid_email")) return "Please enter a valid email";
  if (message.includes("invalid_name")) return "Please enter your name";
  return "Something went wrong. Please try again.";
}

export async function signUpStylist(
  data: SignUpData
): Promise<{ account?: StylistAccount; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: "Database not configured" };
  }

  // Client-side validation (the DB re-validates these too).
  const email = data.email.trim().toLowerCase();
  const name = data.name.trim();
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email" };
  if (data.password.length < 8)
    return { error: "Password must be at least 8 characters" };
  if (!name || name.length > 120) return { error: "Please enter your name" };

  // Password is hashed with bcrypt inside Postgres; it never touches the client.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows, error } = await (supabase as any).rpc("sign_up_stylist", {
    p_email: email,
    p_password: data.password,
    p_name: name,
  });

  if (error) {
    console.error("Error creating account:", error.message);
    return { error: friendlyAuthError(error.message) };
  }

  const row = Array.isArray(rows) ? rows[0] : rows;
  if (!row) return { error: "Failed to create account. Please try again." };

  setSessionToken(row.token ?? null);
  return { account: mapAccountRow(row) };
}

export async function signInStylist(
  data: SignInData
): Promise<{ account?: StylistAccount; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: "Database not configured" };
  }

  const email = data.email.trim().toLowerCase();

  // Verification is done in Postgres; no hashes are ever fetched to the client.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows, error } = await (supabase as any).rpc("sign_in_stylist", {
    p_email: email,
    p_password: data.password,
  });

  if (error) {
    console.error("Error signing in:", error.message);
    return { error: "Invalid email or password" };
  }

  const row = Array.isArray(rows) ? rows[0] : rows;
  if (!row) return { error: "Invalid email or password" };

  setSessionToken(row.token ?? null);
  return { account: mapAccountRow(row) };
}

// Restore a session from the stored token. Returns null (and clears the
// token) if the token is missing, invalid, or expired.
export async function getAccountFromSession(): Promise<StylistAccount | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const token = getSessionToken();
  if (!token) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows, error } = await (supabase as any).rpc(
    "get_account_by_token",
    { p_token: token }
  );

  if (error) return null;
  const row = Array.isArray(rows) ? rows[0] : rows;
  if (!row) {
    setSessionToken(null);
    return null;
  }
  return mapAccountRow(row);
}

export function clearSession(): void {
  setSessionToken(null);
}
