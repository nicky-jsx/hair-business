# Security notes — Hair Korter

## Architecture
The browser only ever holds the public Supabase **anon key**, so the client
is **never trusted**. Security is enforced two ways:

1. **Row Level Security** — the anon key can only *read* public catalog tables
   (stylists, services, specialties, portfolio, reviews, availability) and
   *cannot write to any table directly*.
2. **`SECURITY DEFINER` RPCs** — every privileged action goes through a vetted
   Postgres function. Password hashing (bcrypt) and session-token checks happen
   inside the database; hashes never reach the browser.

Login issues a random **session token** (hashed in the DB, 30-day expiry). Each
write RPC re-derives the caller's account from that token and checks the account
owns the target row.

## Persona test results (verified against the live DB with the anon key)

| Persona | Before | After (`security-hardening.sql`) |
|---|---|---|
| Unauthenticated customer | Could read every account hash + all customer PII; could write any table | Read public catalog only; can only book via validated RPC |
| Authenticated customer | (customers don't authenticate — same as above) | same as above |
| Stylist | Could edit anything | Can edit **only their own** profile/services/availability/bookings (token-checked) |
| Rival stylist / attacker | Could edit/delete **any** stylist's data & cancel any booking | Blocked — `forbidden` unless the token owns the row |
| Admin | No admin role exists | Still none — no privileged UI ships; would need its own gated path |

Empirically confirmed before the fix: inserting into `services`/`bookings`/
`stylists` with the anon key failed only on `NOT NULL` (`23502`), i.e. RLS
allowed the write. After the fix those tables have no write policy, so the anon
role is rejected outright and all writes must go through the ownership-checked
functions.

## What each write RPC enforces
- `create_stylist_profile` / `update_stylist_profile` / `update_stylist_deposit`
  / `update_availability` / `release_date` / `unrelease_date` — token must own
  the stylist.
- `cancel_booking` — token's account must own the booking's stylist.
- `get_stylist_bookings` — stylist derived from the token (can't pass someone
  else's id).
- `create_booking` (public) — **price and deposit are computed in the DB** from
  the catalog + the stylist's deposit settings; the slot must be released and
  free. Client-supplied amounts are ignored, closing price-tampering and
  double-booking.

## Secrets
`.env.local` holds only the anon URL/key (public by design) and is git-ignored.
No `service_role` key exists in the codebase. ✅

## Residual risks (accepted for MVP)
- **Token in `localStorage`** → vulnerable to XSS. Keep the app free of
  injected HTML/`dangerouslySetInnerHTML`; consider an httpOnly cookie + server
  route if this grows.
- **No rate limiting** on sign-in / booking RPCs (brute-force / spam). Add
  Supabase edge rate limits or a captcha before scaling.
- **No admin tooling** — intentionally. Any future admin surface must have its
  own authorization, not rely on client checks.

## To apply
Run `supabase/security-hardening.sql` in the Supabase SQL Editor. It is
idempotent. Existing accounts created under the old SHA-256 scheme must
re-register (their hashes aren't bcrypt).
