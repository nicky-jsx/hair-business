# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose a name (e.g., "strand") and set a database password
4. Select a region close to London (e.g., London or Frankfurt)
5. Wait for the project to be created

## 2. Get Your API Keys

1. Go to **Settings** → **API**
2. Copy the **Project URL** (e.g., `https://xyz.supabase.co`)
3. Copy the **anon/public** key

## 3. Add Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Create the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `supabase/schema.sql`
4. Click "Run" to create all tables, views, and policies

## 5. Add Sample Data (Optional)

1. In the SQL Editor, create another new query
2. Copy and paste the contents of `supabase/seed.sql`
3. Click "Run" to insert sample stylists, services, and reviews

## 6. Restart the Dev Server

```bash
npm run dev
```

The app will now fetch data from your Supabase database instead of using hardcoded sample data.

---

## Database Structure

### Tables

| Table | Description |
|-------|-------------|
| `stylists` | Main stylist profiles (name, bio, region, etc.) |
| `stylist_specialties` | Stylist's specialties (many-to-many) |
| `services` | Services offered with prices and durations |
| `portfolio_photos` | Portfolio images for each stylist |
| `reviews` | Client reviews with ratings and comments |

### Views

| View | Description |
|------|-------------|
| `stylist_ratings` | Aggregated average rating and review count per stylist |

### Row Level Security

All tables have RLS enabled with public read access. Write access will need to be added when you implement stylist authentication.

---

## Fallback Behavior

If Supabase is not configured (no environment variables), the app automatically falls back to the sample data in `src/data/stylists.ts`. This is useful for local development without a database.
