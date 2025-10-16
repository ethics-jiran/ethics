-- Create inquiry_replies table for 1:N relationship
CREATE TABLE inquiry_replies (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,

  -- Reply Content
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  content TEXT NOT NULL CHECK (char_length(content) <= 5000),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_inquiry_replies_inquiry_id ON inquiry_replies(inquiry_id);
CREATE INDEX idx_inquiry_replies_created_at ON inquiry_replies(created_at DESC);
CREATE INDEX idx_inquiry_replies_created_by ON inquiry_replies(created_by);

-- Auto-update updated_at trigger
CREATE TRIGGER update_inquiry_replies_updated_at
  BEFORE UPDATE ON inquiry_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing replies from inquiries table to inquiry_replies table
INSERT INTO inquiry_replies (inquiry_id, title, content, created_at, updated_at, created_by)
SELECT
  id,
  reply_title,
  reply_content,
  COALESCE(replied_at, NOW()),
  COALESCE(replied_at, NOW()),
  COALESCE(replied_by, (SELECT id FROM auth.users LIMIT 1))
FROM inquiries
WHERE reply_title IS NOT NULL AND reply_content IS NOT NULL;

-- Note: We keep reply_* columns in inquiries table for backward compatibility
-- They can be removed in a future migration after confirming everything works
-- ALTER TABLE inquiries DROP COLUMN reply_title;
-- ALTER TABLE inquiries DROP COLUMN reply_content;
-- ALTER TABLE inquiries DROP COLUMN replied_at;
-- ALTER TABLE inquiries DROP COLUMN replied_by;
