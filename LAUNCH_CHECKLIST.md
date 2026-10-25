# Launch checklist — SP Korter (Service Providers)

Work through this top to bottom. Items marked 🔴 are launch blockers.

## 1. Database (Supabase SQL Editor)

Run these **in order**. All are idempotent.

1. `schema.sql` → `accounts-schema.sql` → `booking-schema.sql` →
   `booking-management.sql` → `directory-fields.sql` → `deposit-migration.sql`
   → `release-availability.sql` → `storage.sql` → `security-hardening.sql`
   (skip any already applied).
2. 🔴 `launch-hardening.sql` — locks the database down. **Until this runs,
   every claim token is publicly readable and anyone can claim any profile.**
3. `launch-extras.sql` — takedown/report storage + in-app account deletion.
4. **Do not run** `claim-profile.sql` or `invite-claim.sql` (superseded).

Verify (from any terminal, using your anon key) — these must all **fail**:

```bash
curl "$URL/rest/v1/stylists?select=claim_token&limit=1" -H "apikey: $KEY"
curl -X POST "$URL/rest/v1/rpc/generate_all_claim_urls" -H "apikey: $KEY" \
  -H "Content-Type: application/json" -d '{}'
```

## 2. Environment variables (Vercel → Settings → Environment Variables)

| Name | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public |
| `SUPABASE_SERVICE_ROLE_KEY` | 🔴 **server-only**, needed for image uploads |
| `NEXT_PUBLIC_SITE_URL` | your final domain (sitemap, previews) |

Redeploy after changing them.

## 3. Contact details

🔴 The privacy policy, terms and takedown page promise people a reply.
Set up real mailboxes and update `src/lib/site-config.ts`
(`privacy@`, `legal@`, `takedown@`). Until you own a domain you can point all
three at one monitored address.

Also decide who the "data controller" is. With no company, that is **you**
(a sole trader). Add your name and a contact address to the privacy policy.

## 4. Run this every day after launch

```sql
-- new removal / copyright / report requests
select * from takedown_requests where status = 'new' order by created_at;

-- action one: delete a listing the owner asked to remove
delete from stylists where id = '<stylist uuid>';
update takedown_requests set status = 'actioned' where id = '<request uuid>';

-- remove an abusive review
delete from reviews where id = '<review uuid>';
```

Create invite links and password-reset links (SQL Editor only):

```sql
select * from public.admin_generate_all_claim_urls();
select public.admin_generate_claim_url('<stylist uuid>');
select public.admin_create_password_reset_link('stylist@email.com');
```

## 5. Known gaps (decide before/after launch)

- 🔴 **No booking emails.** The app does not email customers or stylists.
  Stylists only learn of a booking by opening their dashboard; customers must
  save their booking page. The UI no longer claims an email was sent. Add a
  transactional email provider (e.g. Resend, needs a verified domain) as the
  first post-launch feature.
- **No password reset email** — resets are admin-issued links (by design).
- **No Content-Security-Policy** header yet (needs a nonce-based policy).
- **Session token in `localStorage`** — acceptable for MVP, XSS-sensitive.
- **Payments are off-platform.** Deposits/balances are settled with the
  stylist directly; the UI says so.

## 6. Legal / admin (not code)

- UK sole trader: register with HMRC once income > £1,000/tax year.
- ICO data-protection fee: take the ICO self-assessment (usually ~£40/yr).
- If you publish the PWA to app stores: Apple ($99/yr) and Google ($25) accept
  individual accounts; Apple rejects thin website wrappers, so add real native
  value (e.g. push notifications) first. Google personal accounts need a
  closed test (≈12 testers, 14 days) before production.
- Vercel **Hobby** is non-commercial only — move to **Pro** when you earn money.
- Don't import photos/bios you don't have rights to. Unclaimed profiles
  currently use generated placeholders, which is the safe option.
