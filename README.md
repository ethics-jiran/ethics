# Cherish - 고객 문의 관리 시스템

Next.js 15, Supabase, shadcn/ui로 구축된 현대적인 고객 문의 관리 시스템입니다.

## 주요 기능

- ✅ **고객 문의 제출** - 이메일 인증을 통한 웹 폼 문의 제출
- ✅ **이메일 인증 시스템** - 이메일로 전송되는 6자리 영숫자 인증 코드
- ✅ **관리자 패널** - TOTP 2FA 인증이 적용된 안전한 관리자 대시보드
- ✅ **문의 관리** - 고객 문의 조회, 필터링, 검색 및 답변
- ✅ **상태 추적** - 문의 상태 추적 (대기, 처리중, 완료)
- ✅ **FAQ 관리** - 자주 묻는 질문 생성 및 관리
- ✅ **정책 관리** - 서비스 정책 문서 관리
- ✅ **관리자 계정 관리** - 관리자 계정 및 이메일 알림 설정 관리
- ✅ **이메일 알림** - 인증 코드, 답변, 신규 문의 알림 자동 발송
- ✅ **비밀번호 재설정** - 이메일을 통한 안전한 비밀번호 재설정

## 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth + TOTP 2FA
- **UI**: shadcn/ui + Tailwind CSS
- **이메일**: Nodemailer (SMTP)
- **폼 검증**: Zod + React Hook Form
- **상태 관리**: SWR
- **배포**: Vercel

## 프로젝트 구조

```
cherish/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 라우트
│   │   │   ├── inquiry-encrypt/      # 문의 암호화
│   │   │   ├── submit-inquiry/       # 문의 제출
│   │   │   ├── verify-inquiry/       # 문의 인증
│   │   │   ├── email/                # 이메일 발송
│   │   │   ├── faqs/                 # FAQ API
│   │   │   ├── policy/               # 정책 API
│   │   │   ├── reset-password/       # 비밀번호 재설정
│   │   │   └── admin/                # 관리자 전용 API
│   │   │       ├── inquiries/        # 문의 관리
│   │   │       ├── faqs/             # FAQ 관리
│   │   │       ├── policy/           # 정책 관리
│   │   │       └── admins/           # 관리자 계정 관리
│   │   ├── admin/             # 관리자 페이지
│   │   │   ├── inquiries/     # 문의 관리
│   │   │   ├── faqs/          # FAQ 관리
│   │   │   ├── policy/        # 정책 관리
│   │   │   └── admins/        # 관리자 계정 관리
│   │   ├── login/             # 로그인 페이지
│   │   ├── setup-mfa/         # MFA 설정
│   │   ├── reset-password/    # 비밀번호 재설정
│   │   └── update-password/   # 비밀번호 변경
│   ├── components/            # React 컴포넌트
│   │   ├── forms/             # 폼 컴포넌트
│   │   └── ui/                # shadcn/ui 컴포넌트
│   ├── lib/                   # 유틸리티
│   │   ├── supabase/          # Supabase 클라이언트
│   │   └── validations/       # Zod 스키마
│   └── types/                 # TypeScript 타입
├── supabase/
│   └── migrations/            # 데이터베이스 마이그레이션
└── specs/                     # 기능 명세서
```

## 시작하기

### 필수 요구사항

- Node.js 18 이상
- Supabase 계정 또는 로컬 Supabase (Docker 필요)
- SMTP 서버 (이메일 발송용)

### 로컬 개발 환경 설정

1. **저장소 클론 및 의존성 설치**:
   ```bash
   git clone <repository-url>
   cd cherish
   npm install
   ```

2. **환경 변수 설정**:
   `.env.local` 파일 생성:
   ```env
   # Supabase 설정
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # SMTP 설정
   SMTP_HOSTNAME=smtp.example.com
   SMTP_PORT=465
   SMTP_USERNAME=your-email@example.com
   SMTP_PASSWORD=your-password
   SMTP_FROM=noreply@example.com

   # 사이트 URL
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. **Supabase 마이그레이션 적용**:
   ```bash
   # Supabase CLI로 프로젝트 연결
   supabase link --project-ref <your-project-ref>

   # 마이그레이션 적용
   supabase db push
   ```

4. **개발 서버 시작**:
   ```bash
   npm run dev
   ```
   브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

5. **타입 생성** (Supabase 스키마 변경 시):
   ```bash
   supabase gen types typescript --project-id <project-id> > src/types/database.ts
   ```

## 사용 방법

### 고객 플로우

1. **문의 제출**: 메인 페이지에서 문의 작성
2. **이메일 확인**: 이메일로 전송된 인증 코드 확인
3. **상태 확인**: 인증 코드로 문의 상태 및 답변 조회

### 관리자 플로우

1. **로그인**: `/login`에서 관리자 계정 + TOTP 코드로 로그인
2. **문의 관리**: `/admin/inquiries`에서 문의 조회 및 필터링
3. **답변 작성**: 문의 클릭 후 상세 정보 확인 및 답변 작성
4. **FAQ 관리**: `/admin/faqs`에서 FAQ 생성, 수정, 삭제
5. **정책 관리**: `/admin/policy`에서 정책 문서 관리
6. **관리자 설정**: `/admin/admins`에서 관리자 이메일 알림 설정

## API 엔드포인트

### 공개 API

- `POST /api/submit-inquiry` - 새 문의 제출
- `POST /api/verify-inquiry` - 문의 인증 및 조회
- `POST /api/inquiry-encrypt` - 문의 데이터 암호화
- `GET /api/faqs` - FAQ 목록 조회
- `GET /api/policy` - 정책 문서 조회
- `POST /api/reset-password` - 비밀번호 재설정 요청
- `POST /api/update-password` - 비밀번호 변경

### 관리자 API (인증 + MFA 필요)

**문의 관리**
- `GET /api/admin/inquiries` - 문의 목록 조회 (필터링 지원)
- `GET /api/admin/inquiries/[id]` - 문의 상세 조회
- `PATCH /api/admin/inquiries/[id]` - 문의 상태 업데이트
- `POST /api/admin/inquiries/[id]/replies` - 답변 작성

**FAQ 관리**
- `GET /api/admin/faqs` - FAQ 목록 조회
- `POST /api/admin/faqs` - FAQ 생성
- `PATCH /api/admin/faqs/[id]` - FAQ 수정
- `DELETE /api/admin/faqs/[id]` - FAQ 삭제

**정책 관리**
- `GET /api/admin/policy` - 정책 목록 조회
- `POST /api/admin/policy` - 정책 생성
- `PATCH /api/admin/policy/[id]` - 정책 수정
- `DELETE /api/admin/policy/[id]` - 정책 삭제

**관리자 계정 관리**
- `GET /api/admin/admins` - 관리자 목록 조회
- `PATCH /api/admin/admins/[id]` - 관리자 알림 설정 변경

## 데이터베이스 스키마

### inquiries (문의)
- `id` (UUID): 기본 키
- `title`, `content`: 문의 제목 및 내용
- `email`, `name`, `phone`: 고객 정보
- `auth_code`: 6자리 인증 코드
- `status`: pending | processing | completed
- `reply_title`, `reply_content`: 관리자 답변
- `replied_at`, `replied_by`: 답변 메타데이터

### inquiry_replies (문의 답변)
- `id` (UUID): 기본 키
- `inquiry_id`: 문의 ID (외래 키)
- `title`, `content`: 답변 제목 및 내용
- `created_by`: 작성자 (관리자 ID)
- `status`: pending | sent

### faqs (자주 묻는 질문)
- `id` (UUID): 기본 키
- `title`: FAQ 제목
- `content`: FAQ 내용 (배열)
- `display_order`: 표시 순서
- `is_active`: 활성화 여부

### policy (정책)
- `id` (UUID): 기본 키
- `title`: 정책 제목
- `content`: 정책 내용
- `created_by`, `updated_by`: 생성/수정자

### admin_settings (관리자 설정)
- `id` (UUID): 기본 키
- `user_id`: 관리자 사용자 ID
- `receive_notifications`: 이메일 알림 수신 여부

### password_reset_tokens (비밀번호 재설정 토큰)
- `id` (UUID): 기본 키
- `email`: 이메일
- `token`: 재설정 토큰
- `expires_at`: 만료 시간
- `used`: 사용 여부

### aes_keys (AES 암호화 키)
- `key_id` (UUID): 기본 키
- `key`: AES 키
- `expires_at`: 만료 시간
- `consumed`: 사용 여부

## 배포

### Supabase 클라우드 설정

1. [supabase.com](https://supabase.com)에서 프로젝트 생성
2. 마이그레이션 푸시:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

### Vercel 배포

1. GitHub 저장소를 Vercel에 연결
2. Vercel 대시보드에서 환경 변수 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SMTP_HOSTNAME`
   - `SMTP_PORT`
   - `SMTP_USERNAME`
   - `SMTP_PASSWORD`
   - `SMTP_FROM`
   - `NEXT_PUBLIC_SITE_URL`
3. main 브랜치에 푸시하면 자동 배포

## 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드된 앱 실행
npm start

# 린트 실행
npm run lint
```

## 보안 기능

- ✅ TOTP 2FA 인증
- ✅ Row Level Security (RLS) 정책
- ✅ Service Role Key를 사용한 관리자 작업
- ✅ 이메일 인증 코드 시스템
- ✅ 비밀번호 재설정 토큰 (만료 시간 포함)
- ✅ AES 암호화 키 자동 만료

## 라이선스

ISC
