-- RLS Policies for admin_settings table
-- Only authenticated users with MFA (AAL2) can access admin settings

-- Admin full access with MFA
CREATE POLICY "Admin full access with MFA"
ON admin_settings
FOR ALL
TO authenticated
USING ((SELECT auth.jwt()->>'aal') = 'aal2')
WITH CHECK ((SELECT auth.jwt()->>'aal') = 'aal2');
