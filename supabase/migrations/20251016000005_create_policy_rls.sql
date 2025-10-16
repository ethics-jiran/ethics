-- Enable RLS on policy table
ALTER TABLE policy ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read policy (public access)
CREATE POLICY "Anyone can view policy"
  ON policy FOR SELECT
  USING (true);

-- Only admins with MFA can insert policy
CREATE POLICY "Admin can insert policy"
  ON policy FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND (auth.jwt() ->> 'aal') = 'aal2');

-- Only admins with MFA can update policy
CREATE POLICY "Admin can update policy"
  ON policy FOR UPDATE
  USING (auth.uid() IS NOT NULL AND (auth.jwt() ->> 'aal') = 'aal2')
  WITH CHECK (auth.uid() IS NOT NULL AND (auth.jwt() ->> 'aal') = 'aal2');

-- Only admins with MFA can delete policy
CREATE POLICY "Admin can delete policy"
  ON policy FOR DELETE
  USING (auth.uid() IS NOT NULL AND (auth.jwt() ->> 'aal') = 'aal2');
