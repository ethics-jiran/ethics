# Quickstart: Customer Inquiry Management System

**Date**: 2025-10-02
**Feature**: Customer Inquiry Management System
**Branch**: `001-customer-inquiry-management`

## Overview

This quickstart guide provides step-by-step instructions for setting up, developing, and testing the Customer Inquiry Management System locally.

## Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **pnpm**: v8+ (`npm install -g pnpm`)
- **Docker**: For local Supabase instance
- **Supabase CLI**: `npm install -g supabase`
- **Git**: For version control

## Project Setup

### 1. Initialize Next.js Project

```bash
# Navigate to project root
cd /Users/higgs/Project/cherish

# Initialize Next.js 15 with TypeScript and Tailwind
npx create-next-app@latest cherish --typescript --tailwind --app
cd cherish

# Project structure created:
# cherish/
# ├── src/
# │   └── app/           # Next.js app
# ├── package.json
# └── next.config.js
```

### 2. Install Dependencies

```bash
# Install dependencies
pnpm install

# Add Supabase client
pnpm add @supabase/supabase-js @supabase/ssr

# Add shadcn/ui dependencies
pnpm add tailwindcss @tailwindcss/typography
pnpm add class-variance-authority clsx tailwind-merge
pnpm add lucide-react

# Add form handling
pnpm add react-hook-form @hookform/resolvers/zod zod

# Add data fetching
pnpm add swr

# Dev dependencies
pnpm add -D @types/node typescript
```

### 3. Initialize shadcn/ui

```bash
cd cherish

# Initialize shadcn
npx shadcn@latest init

# Choose options:
# - Style: Default
# - Base color: Orange
# - CSS variables: Yes
# - Tailwind config: Yes
# - Components: @/components
# - Utils: @/lib/utils

# Add required components
npx shadcn@latest add dashboard-01
npx shadcn@latest add login-05
npx shadcn@latest add button
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add badge
npx shadcn@latest add select
npx shadcn@latest add toast
npx shadcn@latest add card
```

### 4. Set Up Local Supabase

```bash
# Initialize Supabase project
supabase init

# Start local Supabase (PostgreSQL + Auth + Edge Functions)
supabase start

# Output will show:
# API URL: http://localhost:54321
# anon key: eyJhbGc...
# service_role key: eyJhbGc...

# Save these to .env.local
```

### 5. Configure Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
RESEND_API_KEY=<your-resend-api-key>  # Get from resend.com
```

### 6. Create Database Schema

```bash
# Create migration file
supabase migration new create_inquiries

# Edit: supabase/migrations/<timestamp>_create_inquiries.sql
# (Copy schema from data-model.md)

# Apply migration
supabase db reset
```

Example migration content:
```sql
-- supabase/migrations/001_create_inquiries.sql
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  content TEXT NOT NULL CHECK (char_length(content) <= 5000),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  auth_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'completed')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reply_title TEXT,
  reply_content TEXT,
  replied_at TIMESTAMPTZ,
  replied_by UUID REFERENCES auth.users(id),
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_inquiries_email_auth ON inquiries(email, auth_code);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created ON inquiries(created_at DESC);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Admin policy (requires MFA)
CREATE POLICY "Admin full access with MFA"
ON inquiries
FOR ALL
TO authenticated
USING ((SELECT auth.jwt()->>'aal') = 'aal2');
```

### 7. Generate TypeScript Types

```bash
# Generate types from Supabase schema
supabase gen types typescript --local > src/types/database.ts
```

## Development Workflow

### 1. Start Development Server

```bash
# Terminal 1: Start Supabase
supabase start

# Terminal 2: Start Next.js dev server
pnpm dev

# Access at:
# - http://localhost:3000 (Next.js)
# - http://localhost:54323 (Supabase Studio)
```

### 2. Create Test Admin User

```bash
# Using Supabase Studio (http://localhost:54323)
# 1. Navigate to Authentication > Users
# 2. Create new user:
#    Email: admin@test.com
#    Password: Test123!@#

# Or via SQL:
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'admin@test.com',
  crypt('Test123!@#', gen_salt('bf')),
  NOW()
);
```

### 3. Enroll MFA for Test Admin

```typescript
// One-time setup script: scripts/setup-test-admin-mfa.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Login as test admin
const { data: { user } } = await supabase.auth.signInWithPassword({
  email: 'admin@test.com',
  password: 'Test123!@#',
});

// Enroll TOTP
const { data: mfa } = await supabase.auth.mfa.enroll({
  factorType: 'totp',
});

console.log('Scan this QR code:', mfa.totp.qr_code);
console.log('Or use secret:', mfa.totp.secret);

// Verify with code from authenticator app
const code = '123456'; // From your authenticator
const challenge = await supabase.auth.mfa.challenge({ factorId: mfa.id });
await supabase.auth.mfa.verify({
  factorId: mfa.id,
  challengeId: challenge.data.id,
  code,
});

console.log('MFA enrolled successfully!');
```

### 4. Test Customer Flow

```bash
# Option 1: Use cURL
curl -X POST http://localhost:3000/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Inquiry",
    "content": "This is a test inquiry",
    "email": "customer@test.com",
    "name": "Test Customer"
  }'

# Response: { "id": "...", "message": "..." }

# Check email (local Supabase logs show email content)
# Copy auth code from logs

# Verify inquiry
curl -X POST http://localhost:3000/api/inquiries/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "authCode": "ABC123"
  }'

# Response: { "id": "...", "title": "...", ... }
```

```typescript
// Option 2: Use test script
// tests/manual/test-customer-flow.ts
const res1 = await fetch('http://localhost:3000/api/inquiries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Test Inquiry',
    content: 'This is a test',
    email: 'customer@test.com',
    name: 'Test Customer',
  }),
});

const { id } = await res1.json();
console.log('Created inquiry:', id);

// Get auth code from Supabase Studio or logs
const authCode = 'ABC123';

const res2 = await fetch('http://localhost:3000/api/inquiries/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'customer@test.com',
    authCode,
  }),
});

const inquiry = await res2.json();
console.log('Retrieved inquiry:', inquiry);
```

### 5. Test Admin Flow

```typescript
// tests/manual/test-admin-flow.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://localhost:54321',
  '<anon-key>'
);

// Login
const { data: { session } } = await supabase.auth.signInWithPassword({
  email: 'admin@test.com',
  password: 'Test123!@#',
});

// MFA challenge
const { data: factors } = await supabase.auth.mfa.listFactors();
const factor = factors.totp[0];

const { data: challenge } = await supabase.auth.mfa.challenge({
  factorId: factor.id,
});

// Get code from authenticator app
const code = '123456';

await supabase.auth.mfa.verify({
  factorId: factor.id,
  challengeId: challenge.id,
  code,
});

// Now JWT has aal2 - can access admin endpoints
const res = await fetch('http://localhost:3000/api/admin/inquiries', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
  },
});

const { data: inquiries } = await res.json();
console.log('Admin inquiries:', inquiries);
```

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Output:
# Production: https://cherish-jiran.vercel.app

# Set production environment variables in Vercel dashboard
# Dashboard > Settings > Environment Variables
```

### Deploy Supabase

```bash
# Push migrations to Supabase Cloud
supabase link --project-ref <your-project-ref>
supabase db push

# Deploy Edge Functions
supabase functions deploy send-auth-code
supabase functions deploy send-reply-email
```

## Troubleshooting

### Issue: Supabase connection error

```bash
# Check Supabase is running
supabase status

# Restart if needed
supabase stop
supabase start
```

### Issue: TypeScript errors in database types

```bash
# Regenerate types after schema changes
supabase gen types typescript --local > src/types/database.ts
```

### Issue: MFA verification fails

```bash
# Check time sync on your device (TOTP requires accurate time)
# Verify factor ID matches enrolled factor:
SELECT * FROM auth.mfa_factors WHERE user_id = '<user-id>';
```

### Issue: Email not sending locally

```bash
# Check Supabase logs
supabase functions serve send-auth-code --debug

# Verify RESEND_API_KEY is set
echo $RESEND_API_KEY
```

## Next Steps

1. ✅ Run quickstart setup
2. ✅ Create first test inquiry
3. ✅ Login as admin and reply
4. ⏭️ Run all test suites
5. ⏭️ Review `/tasks` command output for implementation tasks
6. ⏭️ Follow TDD workflow for each task

---

**Ready for implementation!** Run `/tasks` to generate ordered task list.
