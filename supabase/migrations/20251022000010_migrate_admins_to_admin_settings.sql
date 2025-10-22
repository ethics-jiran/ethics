-- Drop old admins table and create admin_settings table
DROP TABLE IF EXISTS admins CASCADE;

-- Create admin_settings table for email notification preferences
-- This table only stores settings; actual admin users are managed in auth.users
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receive_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_settings_user_id ON admin_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_settings_notifications ON admin_settings(receive_notifications) WHERE receive_notifications = true;

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_settings_updated_at();

-- Create RLS policies
CREATE POLICY "Admin full access with MFA"
ON admin_settings
FOR ALL
TO authenticated
USING ((SELECT auth.jwt()->>'aal') = 'aal2')
WITH CHECK ((SELECT auth.jwt()->>'aal') = 'aal2');
