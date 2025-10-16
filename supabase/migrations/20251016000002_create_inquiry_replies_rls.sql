-- Enable RLS on inquiry_replies table
ALTER TABLE inquiry_replies ENABLE ROW LEVEL SECURITY;

-- Admin access policy (requires MFA/AAL2)
CREATE POLICY "Admin can view all replies"
  ON inquiry_replies
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (auth.jwt() ->> 'aal') = 'aal2'
  );

CREATE POLICY "Admin can insert replies"
  ON inquiry_replies
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (auth.jwt() ->> 'aal') = 'aal2'
  );

CREATE POLICY "Admin can update replies"
  ON inquiry_replies
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND (auth.jwt() ->> 'aal') = 'aal2'
  );

CREATE POLICY "Admin can delete replies"
  ON inquiry_replies
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND (auth.jwt() ->> 'aal') = 'aal2'
  );

-- Note: Public users cannot directly access replies
-- They can only see replies through the inquiries relationship
-- which is handled by the verify-inquiry API
