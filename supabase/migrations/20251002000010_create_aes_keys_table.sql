-- Create table for one-time AES keys
CREATE TABLE IF NOT EXISTS aes_keys (
  key_id TEXT PRIMARY KEY,
  key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed BOOLEAN DEFAULT FALSE
);

-- Index for cleanup
CREATE INDEX idx_aes_keys_expires_at ON aes_keys(expires_at);

-- Auto-delete expired keys (runs every minute)
CREATE OR REPLACE FUNCTION delete_expired_aes_keys()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM aes_keys
  WHERE expires_at < NOW();
END;
$$;

-- Note: Enable pg_cron extension in Supabase dashboard
-- Then create a cron job:
-- SELECT cron.schedule('delete-expired-aes-keys', '* * * * *', 'SELECT delete_expired_aes_keys();');
