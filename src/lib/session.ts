// Holds the current stylist's session token. The token is issued by the
// database on sign-in/sign-up and must accompany every privileged write so
// the server can verify ownership. It is NEVER a substitute for that
// server-side check — it is just proof of identity.

const TOKEN_KEY = "hk_session_token";

let cached: string | null = null;

export function setSessionToken(token: string | null): void {
  cached = token;
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore storage failures (private mode, etc.)
  }
}

export function getSessionToken(): string | null {
  if (cached) return cached;
  if (typeof window === "undefined") return null;
  try {
    cached = window.localStorage.getItem(TOKEN_KEY);
  } catch {
    cached = null;
  }
  return cached;
}
