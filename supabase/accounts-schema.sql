-- Stylist Accounts Schema
-- Run this in Supabase SQL Editor after the other schemas

-- Stylist accounts table (simple email/password auth)
CREATE TABLE stylist_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  stylist_id UUID REFERENCES stylists(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX idx_stylist_accounts_email ON stylist_accounts(email);

-- Enable RLS
ALTER TABLE stylist_accounts ENABLE ROW LEVEL SECURITY;

-- SECURITY: NO policies. Accounts are only touched by SECURITY DEFINER
-- RPCs (sign_up_stylist / sign_in_stylist / ...). Public policies here
-- would expose every password hash.

-- Trigger for updated_at
CREATE TRIGGER stylist_accounts_updated_at
  BEFORE UPDATE ON stylist_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
