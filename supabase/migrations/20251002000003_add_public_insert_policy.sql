-- Add policy for anonymous users to insert inquiries
CREATE POLICY "Allow anonymous inquiry submission"
ON customer_inquiries FOR INSERT TO anon
WITH CHECK (true);
