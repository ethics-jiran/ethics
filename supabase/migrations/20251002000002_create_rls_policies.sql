-- Enable Row Level Security
ALTER TABLE customer_inquiries ENABLE ROW LEVEL SECURITY;

-- Admin full access policy (requires MFA - aal2)
CREATE POLICY "Admin full access with MFA"
ON customer_inquiries
FOR ALL
TO authenticated
USING (
  (SELECT auth.jwt()->>'aal') = 'aal2'
)
WITH CHECK (
  (SELECT auth.jwt()->>'aal') = 'aal2'
);
