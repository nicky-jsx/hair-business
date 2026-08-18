-- Deposit & payment options migration for Hair Korter
-- Run this once in your Supabase SQL Editor.

-- 1) Deposit settings on the stylist (set by the stylist)
ALTER TABLE stylists
  ADD COLUMN IF NOT EXISTS deposit_type TEXT NOT NULL DEFAULT 'none'
    CHECK (deposit_type IN ('none', 'percentage', 'fixed')),
  ADD COLUMN IF NOT EXISTS deposit_value NUMERIC NOT NULL DEFAULT 0;

-- 2) Payment choice captured on each booking
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS payment_option TEXT NOT NULL DEFAULT 'full'
    CHECK (payment_option IN ('deposit', 'full')),
  ADD COLUMN IF NOT EXISTS deposit_amount INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_price INTEGER;

-- 3) Specific appointment times the stylist offers per day
ALTER TABLE stylist_availability
  ADD COLUMN IF NOT EXISTS slots JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 4) Allow stylists to update their own deposit settings and availability slots
DROP POLICY IF EXISTS "Public update deposit" ON stylists;
CREATE POLICY "Public update deposit" ON stylists
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public update availability" ON stylist_availability;
CREATE POLICY "Public update availability" ON stylist_availability
  FOR UPDATE USING (true) WITH CHECK (true);
