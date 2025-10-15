-- Create faqs table
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT[], -- Array of content lines
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for ordering
CREATE INDEX IF NOT EXISTS idx_faqs_display_order ON faqs(display_order);
CREATE INDEX IF NOT EXISTS idx_faqs_is_active ON faqs(is_active);

-- Enable RLS
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Anyone can view active accordion items" ON faqs;
DROP POLICY IF EXISTS "Authenticated users can manage accordion items" ON faqs;

-- Public can read active items
CREATE POLICY "Anyone can view active FAQs"
  ON faqs
  FOR SELECT
  USING (is_active = true);

-- Authenticated users can manage all items
CREATE POLICY "Authenticated users can manage FAQs"
  ON faqs
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Insert default data if table is empty
INSERT INTO faqs (title, content, display_order)
SELECT * FROM (VALUES
  ('회사 자산의 부당 및 과다 사용', ARRAY[
    '- 법인카드 등 회사 자산의 과도한 사용, 목적에 맞지 않은 용도로 전용하는 경우',
    '- 접대비 및 복리후생비를 지정된 수준을 넘어 사용하거나 업무와 무관한 목적으로 사용한 경우',
    '- 허위 영수증을 통한 비용처리, 무증빙 처리 제도의 사적인 용도로의 악용',
    '- 회계 처리가 어려운 개인 사용 경비 등을 타 계정으로 대체하는 행위',
    '- 회사의 차량, PC 등의 용품을 개인 용도로 무단 반출, 사용하는 경우',
    '- 회사의 공금의 무단 인출, 사적 융통 등을 통해 개인적으로 착복하는 행위'
  ], 1),
  ('거래업체를 통한 부당 이익 추구', NULL, 2),
  ('직장 내 괴롭힘', NULL, 3),
  ('사내 외 성희롱 및 차별 등의 부당대우', NULL, 4),
  ('이해 관계자로부터의 금품수수', NULL, 5),
  ('문서 조작 및 허위 보고', NULL, 6)
) AS v(title, content, display_order)
WHERE NOT EXISTS (SELECT 1 FROM faqs);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_faqs_updated_at ON faqs;
CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
