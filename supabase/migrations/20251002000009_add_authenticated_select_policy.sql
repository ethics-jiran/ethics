-- Add permissive SELECT policy for authenticated users
-- This allows authenticated users to see all inquiries
CREATE POLICY "Authenticated users can view all inquiries"
ON inquiries
FOR SELECT
TO authenticated
USING (true);

-- Add permissive UPDATE policy for authenticated users
CREATE POLICY "Authenticated users can update all inquiries"
ON inquiries
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- The existing RESTRICTIVE policy "Enforce MFA for admin access"
-- will enforce AAL2 requirement on top of these permissive policies
