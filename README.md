# Hair Korter — London stylist directory & booking (PWA)

A mobile-first progressive web app for discovering and booking hair and beauty
professionals in London. Built with Next.js 15 (App Router), React 19,
TypeScript, Tailwind CSS and Supabase.

## Features

- **Discover** — browse/search ~400 stylists by name, borough or specialty
- **Profiles** — services, portfolio, reviews, booking policy
- **Booking** — customers book released slots; manage/cancel/reschedule via a
  private link; review after the appointment
- **Stylist dashboard** — release dates, weekly times, deposit settings,
  bookings, profile editing, account deletion
- **Invite-only claiming** — unclaimed listings are claimed with a one-time link
- **Trust & safety** — takedown / copyright / report form, privacy policy, terms

Payments are **not** handled in the app; deposits and balances are settled
directly with the stylist.

## Getting started

```bash
cp .env.local.example .env.local   # then fill in your Supabase values
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Going live

See **[LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md)** for the ordered list of
SQL migrations, environment variables and admin tasks, and
**[SECURITY.md](./SECURITY.md)** for the security model.

## Project structure

```
src/
├── app/                  # Next.js App Router pages & API routes
│   ├── api/upload-url/   # signed image-upload URLs (server-only key)
│   ├── stylists/         # directory + profile pages
│   ├── stylist/          # sign-in, claim, dashboard, edit, reset-password
│   ├── booking/manage/   # customer booking management
│   └── privacy, terms, takedown
├── components/           # layout, search, stylist, booking, ui, pwa
├── context/              # Auth + stylist store providers
├── lib/                  # Supabase access, session, site config
└── types/
supabase/                 # SQL migrations (see LAUNCH_CHECKLIST.md for order)
```
