-- Booking System Schema for Hair Korter
-- Run this in your Supabase SQL Editor after schema.sql

-- Stylist availability (working hours per day of week)
CREATE TABLE stylist_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL DEFAULT '09:00',
  end_time TIME NOT NULL DEFAULT '21:00',
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(stylist_id, day_of_week)
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blocked times (holidays, time off, breaks)
CREATE TABLE blocked_times (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_bookings_stylist_date ON bookings(stylist_id, booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_availability_stylist ON stylist_availability(stylist_id);
CREATE INDEX idx_blocked_times_stylist_date ON blocked_times(stylist_id, blocked_date);

-- Enable RLS
ALTER TABLE stylist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_times ENABLE ROW LEVEL SECURITY;

-- Public read access for availability (customers need to see available slots)
CREATE POLICY "Public read access" ON stylist_availability FOR SELECT USING (true);
CREATE POLICY "Public read access" ON bookings FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read access" ON blocked_times FOR SELECT USING (true);

-- Trigger for updated_at
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert default availability for existing stylists (Mon-Sat, 9am-9pm)
INSERT INTO stylist_availability (stylist_id, day_of_week, start_time, end_time, is_available)
SELECT 
  s.id,
  d.day,
  '09:00'::TIME,
  '21:00'::TIME,
  CASE WHEN d.day = 0 THEN false ELSE true END -- Sunday off by default
FROM stylists s
CROSS JOIN (SELECT generate_series(0, 6) AS day) d
ON CONFLICT (stylist_id, day_of_week) DO NOTHING;
