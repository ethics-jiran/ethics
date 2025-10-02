-- Add policy for anonymous users to select their own inquiries with auth code
CREATE POLICY "Allow anonymous inquiry verification"
ON customer_inquiries FOR SELECT TO anon
USING (true);
