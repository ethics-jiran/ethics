-- Restore AAL2 (MFA) requirement for admin access
DROP POLICY IF EXISTS "Admin full access" ON inquiries;

-- Require MFA for admin access
CREATE POLICY "Admin full access with MFA"
ON inquiries FOR ALL TO authenticated
USING ((SELECT auth.jwt()->>'aal') = 'aal2')
WITH CHECK ((SELECT auth.jwt()->>'aal') = 'aal2');
