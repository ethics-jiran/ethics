-- Drop existing permissive policies
DROP POLICY IF EXISTS "Admin full access with MFA" ON inquiries;
DROP POLICY IF EXISTS "Admin full access" ON inquiries;
DROP POLICY IF EXISTS "Allow anonymous inquiry submission" ON inquiries;
DROP POLICY IF EXISTS "Allow anonymous inquiry verification" ON inquiries;

-- Recreate anonymous policies (permissive - default)
CREATE POLICY "Allow anonymous inquiry submission"
ON inquiries FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "Allow anonymous inquiry verification"
ON inquiries FOR SELECT TO anon
USING (true);

-- Create RESTRICTIVE MFA policy for authenticated users
-- This enforces AAL2 (MFA) requirement and overrides other policies
CREATE POLICY "Enforce MFA for admin access"
ON inquiries
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'aal' = 'aal2')
WITH CHECK (auth.jwt() ->> 'aal' = 'aal2');
