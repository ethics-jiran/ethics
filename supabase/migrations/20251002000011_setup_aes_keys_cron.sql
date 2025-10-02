-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Setup cron job to delete expired AES keys every minute
SELECT cron.schedule(
  'delete-expired-aes-keys',
  '* * * * *',
  'SELECT delete_expired_aes_keys();'
);
