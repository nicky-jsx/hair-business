-- Supabase Schema for Hair Korter - Stylist Discovery App
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Regions enum
create type region as enum ('North', 'East', 'South', 'West');

-- Price range enum
create type price_range as enum ('£', '££', '£££');

-- Specialties enum
create type specialty as enum (
  'Braids',
  'Locs',
  'Natural Hair',
  'Silk Press',
  'Color',
  'Cuts',
  'Extensions',
  'Wigs',
  'Eyelashes'
);

-- Stylists table
create table stylists (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  tagline text not null,
  bio text not null,
  avatar_url text not null,
  cover_image_url text not null,
  region region not null,
  years_experience integer not null default 0,
  price_range price_range not null default '££',
  featured boolean not null default false,
  booking_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Stylist specialties (many-to-many)
create table stylist_specialties (
  id uuid primary key default uuid_generate_v4(),
  stylist_id uuid not null references stylists(id) on delete cascade,
  specialty specialty not null,
  unique(stylist_id, specialty)
);

-- Services table
create table services (
  id uuid primary key default uuid_generate_v4(),
  stylist_id uuid not null references stylists(id) on delete cascade,
  name text not null,
  price integer not null,
  duration text not null,
  created_at timestamp with time zone default now()
);

-- Portfolio photos
create table portfolio_photos (
  id uuid primary key default uuid_generate_v4(),
  stylist_id uuid not null references stylists(id) on delete cascade,
  photo_url text not null,
  sort_order integer not null default 0,
  created_at timestamp with time zone default now()
);

-- Reviews table
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  stylist_id uuid not null references stylists(id) on delete cascade,
  reviewer_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now()
);

-- Create indexes for performance
create index idx_stylists_region on stylists(region);
create index idx_stylists_featured on stylists(featured);
create index idx_stylists_price_range on stylists(price_range);
create index idx_stylist_specialties_stylist on stylist_specialties(stylist_id);
create index idx_services_stylist on services(stylist_id);
create index idx_portfolio_stylist on portfolio_photos(stylist_id);
create index idx_reviews_stylist on reviews(stylist_id);

-- Create a view for stylist ratings
create view stylist_ratings as
select 
  stylist_id,
  round(avg(rating)::numeric, 1) as rating,
  count(*) as review_count
from reviews
group by stylist_id;

-- Row Level Security (RLS) policies
-- For now, allow public read access to all tables

alter table stylists enable row level security;
alter table stylist_specialties enable row level security;
alter table services enable row level security;
alter table portfolio_photos enable row level security;
alter table reviews enable row level security;

-- Public read access policies
create policy "Public read access" on stylists for select using (true);
create policy "Public read access" on stylist_specialties for select using (true);
create policy "Public read access" on services for select using (true);
create policy "Public read access" on portfolio_photos for select using (true);
create policy "Public read access" on reviews for select using (true);

-- Function to update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for stylists updated_at
create trigger stylists_updated_at
  before update on stylists
  for each row
  execute function update_updated_at();
