import type { StylistAccount } from "@/types/account";
import type { Stylist } from "@/types/stylist";

const ACCOUNTS_KEY = "strand_accounts";
const SESSION_KEY = "strand_session";
const CUSTOM_STYLISTS_KEY = "strand_custom_stylists";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getAccounts(): StylistAccount[] {
  return readJson<StylistAccount[]>(ACCOUNTS_KEY, []);
}

export function getSessionAccountId(): string | null {
  return readJson<string | null>(SESSION_KEY, null);
}

export function getCurrentAccount(): StylistAccount | null {
  const id = getSessionAccountId();
  if (!id) return null;
  return getAccounts().find((a) => a.id === id) ?? null;
}

export function signUp(
  name: string,
  email: string,
  _password: string
): { account: StylistAccount } | { error: string } {
  const accounts = getAccounts();
  const normalised = email.trim().toLowerCase();

  if (accounts.some((a) => a.email === normalised)) {
    return { error: "An account with this email already exists." };
  }

  const account: StylistAccount = {
    id: crypto.randomUUID(),
    email: normalised,
    name: name.trim(),
    stylistId: null,
    createdAt: new Date().toISOString(),
  };

  writeJson(ACCOUNTS_KEY, [...accounts, account]);
  writeJson(SESSION_KEY, account.id);

  return { account };
}

export function signOut(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getCustomStylists(): Stylist[] {
  return readJson<Stylist[]>(CUSTOM_STYLISTS_KEY, []).map((stylist) => ({
    ...stylist,
    bookingUrl: stylist.bookingUrl ?? null,
  }));
}

export function saveCustomStylist(stylist: Stylist): void {
  const existing = getCustomStylists();
  writeJson(CUSTOM_STYLISTS_KEY, [...existing, stylist]);
}

export function linkProfileToAccount(accountId: string, stylistId: string): void {
  const accounts = getAccounts();
  writeJson(
    ACCOUNTS_KEY,
    accounts.map((a) =>
      a.id === accountId ? { ...a, stylistId } : a
    )
  );
}

export function updateCustomStylist(stylist: Stylist): void {
  const existing = getCustomStylists();
  writeJson(
    CUSTOM_STYLISTS_KEY,
    existing.map((s) => (s.id === stylist.id ? stylist : s))
  );
}
