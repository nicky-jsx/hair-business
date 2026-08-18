# Hair Korter — Stylist Discovery MVP

A mobile-first stylist discovery app for London, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Home** — Hero, search, specialty shortcuts, featured stylists
- **Discover** — Search and filter stylists by name, location, or specialty
- **Profile** — View stylist details, bio, and specialties

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Home
│   └── stylists/
│       ├── page.tsx      # Browse & search
│       └── [id]/page.tsx # Stylist profile
├── components/
│   ├── layout/           # Header, bottom nav
│   ├── search/           # SearchBar, CategoryChips
│   ├── stylist/          # StylistCard, StylistGrid
│   └── ui/               # Button, Badge, Avatar
├── data/
│   └── stylists.ts       # Sample stylist data & filters
└── types/
    └── stylist.ts        # TypeScript interfaces
```

## Tech stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
