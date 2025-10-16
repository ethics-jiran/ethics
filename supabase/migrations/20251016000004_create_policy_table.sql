-- Create policy table for counselor protection policy
CREATE TABLE policy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  content TEXT NOT NULL CHECK (char_length(content) <= 50000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create index for faster queries
CREATE INDEX idx_policy_updated_at ON policy(updated_at DESC);

-- Auto-update trigger for updated_at
CREATE TRIGGER update_policy_updated_at
  BEFORE UPDATE ON policy
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial policy (can be updated by admin)
INSERT INTO policy (title, content)
VALUES (
  '상담자 보호정책',
  '상담자 보호정책 내용이 여기에 표시됩니다. 관리자 페이지에서 수정할 수 있습니다.'
);
