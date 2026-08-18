-- Date-specific availability ("released" dates) for Hair Korter
-- Stylists release specific dates (with specific times) ahead of time.
-- A date is only bookable once it has been released.

CREATE TABLE IF NOT EXISTS stylist_date_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  slots JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(stylist_id, date)
);

CREATE INDEX IF NOT EXISTS idx_date_availability_stylist
  ON stylist_date_availability(stylist_id, date);

ALTER TABLE stylist_date_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read date availability" ON stylist_date_availability;
CREATE POLICY "Public read date availability" ON stylist_date_availability
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert date availability" ON stylist_date_availability;
CREATE POLICY "Public insert date availability" ON stylist_date_availability
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update date availability" ON stylist_date_availability;
CREATE POLICY "Public update date availability" ON stylist_date_availability
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public delete date availability" ON stylist_date_availability;
CREATE POLICY "Public delete date availability" ON stylist_date_availability
  FOR DELETE USING (true);
