import { getSupabase } from "./supabase";

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

// Simple hash function (for demo - in production use bcrypt)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "strand-salt-2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signUpStylist(
  data: SignUpData
): Promise<{ account?: StylistAccount; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: "Database not configured" };
  }

  // Check if email already exists
  const { data: existing } = await supabase
    .from("stylist_accounts")
    .select("id")
    .eq("email", data.email.toLowerCase())
    .single();

  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await hashPassword(data.password);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: result, error } = await (supabase as any)
    .from("stylist_accounts")
    .insert({
      email: data.email.toLowerCase(),
      password_hash: passwordHash,
      name: data.name,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating account:", error);
    return { error: "Failed to create account. Please try again." };
  }

  return {
    account: {
      id: result.id,
      email: result.email,
      name: result.name,
      stylistId: result.stylist_id,
    },
  };
}

export async function signInStylist(
  data: SignInData
): Promise<{ account?: StylistAccount; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: "Database not configured" };
  }

  const passwordHash = await hashPassword(data.password);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: result, error } = await (supabase as any)
    .from("stylist_accounts")
    .select("*")
    .eq("email", data.email.toLowerCase())
    .eq("password_hash", passwordHash)
    .single();

  if (error || !result) {
    return { error: "Invalid email or password" };
  }

  return {
    account: {
      id: result.id,
      email: result.email,
      name: result.name,
      stylistId: result.stylist_id,
    },
  };
}

export async function getAccountById(
  id: string
): Promise<StylistAccount | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("stylist_accounts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    stylistId: data.stylist_id,
  };
}

export async function linkStylistProfile(
  accountId: string,
  stylistId: string
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: "Database not configured" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("stylist_accounts")
    .update({ stylist_id: stylistId })
    .eq("id", accountId);

  if (error) {
    console.error("Error linking profile:", error);
    return { error: "Failed to link profile" };
  }

  return {};
}
