-- Add status column to inquiry_replies table
ALTER TABLE inquiry_replies
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' CHECK (
  status IN ('pending', 'processing', 'completed')
);

-- Create index for status queries
CREATE INDEX idx_inquiry_replies_status ON inquiry_replies(status);

-- Update existing replies to 'completed' status
UPDATE inquiry_replies SET status = 'completed';
