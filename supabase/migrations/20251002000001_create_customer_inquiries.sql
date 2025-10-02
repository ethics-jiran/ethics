-- Create customer_inquiries table
CREATE TABLE customer_inquiries (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Inquiry Content
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  content TEXT NOT NULL CHECK (char_length(content) <= 5000),

  -- Customer Information
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,  -- Optional

  -- Verification
  auth_code TEXT NOT NULL,  -- 6-digit alphanumeric

  -- Status Management
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'completed')
  ),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Admin Response (nullable until replied)
  reply_title TEXT,
  reply_content TEXT,
  replied_at TIMESTAMPTZ,
  replied_by UUID REFERENCES auth.users(id),

  -- Email format constraint
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for common queries
CREATE INDEX idx_customer_inquiries_email_auth ON customer_inquiries(email, auth_code);
CREATE INDEX idx_customer_inquiries_status ON customer_inquiries(status);
CREATE INDEX idx_customer_inquiries_created ON customer_inquiries(created_at DESC);
CREATE INDEX idx_customer_inquiries_replied_by ON customer_inquiries(replied_by) WHERE replied_by IS NOT NULL;

-- Auto-update updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_customer_inquiries_updated_at
  BEFORE UPDATE ON customer_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
