-- Temporarily remove AAL2 requirement for admin access
DROP POLICY IF EXISTS "Admin full access with MFA" ON inquiries;

-- Allow authenticated users to access all inquiries (MFA check temporarily disabled)
CREATE POLICY "Admin full access"
ON inquiries FOR ALL TO authenticated
USING (true)
WITH CHECK (true);
