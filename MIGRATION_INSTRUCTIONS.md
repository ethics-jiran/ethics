# 관리자 테이블 마이그레이션 가이드

## 상황
기존 `admins` 테이블이 존재하며, 이를 `admin_settings` 테이블로 교체해야 합니다.

## Supabase Dashboard에서 실행할 SQL

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 (yzhxzbcsrszfbwrjecaj)
3. 왼쪽 메뉴 → **SQL Editor** 클릭
4. 아래 SQL 전체를 복사해서 붙여넣기
5. **RUN** 버튼 클릭

```sql
-- Step 1: Drop old admins table if exists
DROP TABLE IF EXISTS admins CASCADE;

-- Step 2: Create admin_settings table for email notification preferences
-- This table only stores settings; actual admin users are managed in auth.users
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receive_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 3: Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_settings_user_id ON admin_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_settings_notifications ON admin_settings(receive_notifications) WHERE receive_notifications = true;

-- Step 4: Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Step 5: Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_settings_updated_at();

-- Step 6: Create RLS policies for admin_settings table
-- Only authenticated users with MFA (AAL2) can access admin settings
CREATE POLICY "Admin full access with MFA"
ON admin_settings
FOR ALL
TO authenticated
USING ((SELECT auth.jwt()->>'aal') = 'aal2')
WITH CHECK ((SELECT auth.jwt()->>'aal') = 'aal2');
```

## 완료 후 확인사항
1. SQL 실행이 성공했는지 확인
2. 브라우저에서 http://localhost:3002/admin/admins 새로고침
3. auth.users에 등록된 관리자 목록이 표시되는지 확인
4. 이메일 알림 수신 토글 스위치가 작동하는지 테스트

## 주의사항
- 기존 `admins` 테이블의 데이터는 삭제됩니다
- 이메일 수신 설정은 기본값(true)으로 초기화됩니다
- 관리자 계정은 auth.users에서 자동으로 불러옵니다
