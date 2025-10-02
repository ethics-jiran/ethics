-- Rename table from customer_inquiries to inquiries
ALTER TABLE customer_inquiries RENAME TO inquiries;

-- Update RLS policies to reference new table name
DROP POLICY IF EXISTS "Admin full access with MFA" ON inquiries;
DROP POLICY IF EXISTS "Allow anonymous inquiry submission" ON inquiries;
DROP POLICY IF EXISTS "Allow anonymous inquiry verification" ON inquiries;

-- Recreate RLS policies with new table name
CREATE POLICY "Admin full access with MFA"
ON inquiries FOR ALL TO authenticated
USING ((SELECT auth.jwt()->>'aal') = 'aal2');

CREATE POLICY "Allow anonymous inquiry submission"
ON inquiries FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "Allow anonymous inquiry verification"
ON inquiries FOR SELECT TO anon
USING (true);
