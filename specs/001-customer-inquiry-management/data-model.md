# Data Model: Customer Inquiry Management System

**Date**: 2025-10-02
**Feature**: Customer Inquiry Management System
**Branch**: `001-customer-inquiry-management`

## Overview

This document defines the database schema, relationships, and validation rules for the Customer Inquiry Management System.

## Entity Relationship Diagram

```
┌─────────────────────────┐
│   inquiries    │
├─────────────────────────┤
│ id (PK)                 │
│ title                   │
│ content                 │
│ email                   │
│ name                    │
│ phone                   │
│ auth_code               │
│ status                  │
│ created_at              │
│ updated_at              │
│ reply_title             │
│ reply_content           │
│ replied_at              │
│ replied_by (FK)         │
└─────────────────────────┘
         │
         │ replied_by
         ▼
┌─────────────────────────┐
│   auth.users            │  (Supabase managed)
├─────────────────────────┤
│ id (PK)                 │
│ email                   │
│ encrypted_password      │
│ ...                     │
│ (MFA factors managed    │
│  by Supabase Auth)      │
└─────────────────────────┘
```

## Entities

### 1. inquiries

**Purpose**: Stores customer support inquiries and admin responses

**Table Definition**:
```sql
CREATE TABLE inquiries (
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

  -- Indexes for common queries
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes
CREATE INDEX idx_inquiries_email_auth ON inquiries(email, auth_code);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created ON inquiries(created_at DESC);
CREATE INDEX idx_inquiries_replied_by ON inquiries(replied_by) WHERE replied_by IS NOT NULL;

-- Auto-update updated_at trigger
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
```

**Field Details**:

| Field | Type | Nullable | Default | Validation | Purpose |
|-------|------|----------|---------|------------|---------|
| `id` | UUID | No | `gen_random_uuid()` | - | Primary key |
| `title` | TEXT | No | - | Max 200 chars | Inquiry subject |
| `content` | TEXT | No | - | Max 5000 chars | Inquiry body |
| `email` | TEXT | No | - | Valid email format | Customer contact |
| `name` | TEXT | No | - | - | Customer name |
| `phone` | TEXT | Yes | NULL | - | Optional phone number |
| `auth_code` | TEXT | No | - | 6 chars | Verification code (generated server-side) |
| `status` | TEXT | No | `'pending'` | Enum: pending, processing, completed | Current inquiry state |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | - | Submission timestamp |
| `updated_at` | TIMESTAMPTZ | No | `NOW()` | Auto-updated | Last modification timestamp |
| `reply_title` | TEXT | Yes | NULL | - | Admin response title |
| `reply_content` | TEXT | Yes | NULL | - | Admin response body |
| `replied_at` | TIMESTAMPTZ | Yes | NULL | - | Response timestamp |
| `replied_by` | UUID | Yes | NULL | FK to auth.users | Admin who replied |

**State Transitions**:
```
pending → processing → completed
   ↑          ↓
   └──────────┘ (can revert)
```

**Constraints**:
- `title` and `content` are required and have length limits
- `email` must match email regex pattern
- `auth_code` generated server-side (6-character alphanumeric, uppercase)
- `status` restricted to enum values
- `reply_*` fields nullable until admin responds
- `replied_by` must reference valid admin user

### 2. auth.users (Supabase Managed)

**Purpose**: Administrator authentication and authorization

**Managed by Supabase Auth**:
- Email/password authentication
- TOTP MFA factors (via `auth.mfa_factors` table)
- Session management
- JWT token issuance with `aal` claim

**Key Fields** (read-only for application):
- `id`: UUID primary key
- `email`: Admin email
- `encrypted_password`: Bcrypt hashed
- `confirmed_at`: Email confirmation timestamp
- `last_sign_in_at`: Last login timestamp

**MFA Integration**:
- Admins enroll TOTP via `supabase.auth.mfa.enroll()`
- MFA factors stored in `auth.mfa_factors` (Supabase managed)
- JWT includes `aal: "aal2"` claim after MFA verification
- RLS policies enforce `aal2` requirement for admin operations

## Row Level Security (RLS) Policies

### Admin Access (requires MFA)

```sql
-- Enable RLS
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Admin full access (requires AAL2 = MFA completed)
CREATE POLICY "Admin full access with MFA"
ON inquiries
FOR ALL
TO authenticated
USING (
  (SELECT auth.jwt()->>'aal') = 'aal2'
)
WITH CHECK (
  (SELECT auth.jwt()->>'aal') = 'aal2'
);
```

**Enforcement**:
- Only authenticated users with `aal2` (MFA verified) can access
- Applies to SELECT, INSERT, UPDATE, DELETE operations
- Prevents admin bypass without 2FA

### Customer Read-Only Access

```sql
-- Customer can only read their own inquiry via email + auth_code
CREATE POLICY "Customer read own inquiry"
ON inquiries
FOR SELECT
TO anon
USING (
  email = current_setting('request.jwt.claims', true)::json->>'email'
  AND auth_code = current_setting('request.jwt.claims', true)::json->>'auth_code'
);
```

**Note**: This policy is for documentation; actual implementation will use server-side verification in API route rather than JWT claims, as customers don't have persistent sessions.

**Actual Implementation**:
```typescript
// app/api/inquiries/verify/route.ts
const { data } = await supabase
  .from('inquiries')
  .select()
  .eq('email', email)
  .eq('auth_code', authCode)
  .single();
```

## Validation Rules

### Server-Side Validation (Zod Schemas)

**Create Inquiry**:
```typescript
import { z } from 'zod';

export const createInquirySchema = z.object({
  title: z.string().min(1, 'Title required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content required').max(5000, 'Content too long'),
  email: z.string().email('Invalid email'),
  name: z.string().min(1, 'Name required'),
  phone: z.string().optional(),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
```

**Verify Inquiry**:
```typescript
export const verifyInquirySchema = z.object({
  email: z.string().email(),
  authCode: z.string().length(6, 'Code must be 6 characters').toUpperCase(),
});
```

**Send Reply**:
```typescript
export const sendReplySchema = z.object({
  replyTitle: z.string().min(1, 'Reply title required'),
  replyContent: z.string().min(1, 'Reply content required'),
  status: z.enum(['pending', 'processing', 'completed']).optional(),
});
```

**Update Status**:
```typescript
export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed']),
});
```

## TypeScript Types (Auto-Generated)

**Database Types** (from Supabase CLI):
```typescript
// types/database.ts (auto-generated)
export type Database = {
  public: {
    Tables: {
      inquiries: {
        Row: {
          id: string;
          title: string;
          content: string;
          email: string;
          name: string;
          phone: string | null;
          auth_code: string;
          status: 'pending' | 'processing' | 'completed';
          created_at: string;
          updated_at: string;
          reply_title: string | null;
          reply_content: string | null;
          replied_at: string | null;
          replied_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          email: string;
          name: string;
          phone?: string | null;
          auth_code: string;
          status?: 'pending' | 'processing' | 'completed';
          created_at?: string;
          updated_at?: string;
          reply_title?: string | null;
          reply_content?: string | null;
          replied_at?: string | null;
          replied_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          email?: string;
          name?: string;
          phone?: string | null;
          auth_code?: string;
          status?: 'pending' | 'processing' | 'completed';
          created_at?: string;
          updated_at?: string;
          reply_title?: string | null;
          reply_content?: string | null;
          replied_at?: string | null;
          replied_by?: string | null;
        };
      };
    };
  };
};
```

## Data Integrity Rules

1. **Uniqueness**: `id` is unique (UUID primary key)
2. **Referential Integrity**: `replied_by` must reference existing `auth.users.id`
3. **Check Constraints**:
   - `status` must be one of: pending, processing, completed
   - `title` max 200 characters
   - `content` max 5000 characters
   - `email` matches email regex
4. **Not Null**: `id`, `title`, `content`, `email`, `name`, `auth_code`, `status`, `created_at`, `updated_at`
5. **Auto-Update**: `updated_at` automatically set on every update

## Query Patterns

### Customer Operations

**Submit Inquiry**:
```sql
INSERT INTO inquiries (title, content, email, name, phone, auth_code)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, auth_code;
```

**Verify & Retrieve Inquiry**:
```sql
SELECT id, title, content, email, name, phone, status, created_at,
       reply_title, reply_content, replied_at
FROM inquiries
WHERE email = $1 AND auth_code = $2;
```

### Admin Operations

**List Inquiries (with filters)**:
```sql
SELECT id, title, email, name, status, created_at
FROM inquiries
WHERE ($1::text IS NULL OR status = $1)
  AND ($2::text IS NULL OR title ILIKE '%' || $2 || '%' OR name ILIKE '%' || $2 || '%')
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;
```

**Get Inquiry Detail**:
```sql
SELECT * FROM inquiries
WHERE id = $1;
```

**Send Reply**:
```sql
UPDATE inquiries
SET reply_title = $2,
    reply_content = $3,
    replied_at = NOW(),
    replied_by = $4,
    status = COALESCE($5, status)
WHERE id = $1
RETURNING *;
```

**Update Status**:
```sql
UPDATE inquiries
SET status = $2
WHERE id = $1
RETURNING *;
```

## Performance Considerations

1. **Indexes**:
   - `(email, auth_code)`: Fast customer verification
   - `status`: Fast admin filtering
   - `created_at DESC`: Fast chronological listing
   - `replied_by`: Fast admin activity tracking

2. **Query Optimization**:
   - Use `LIMIT` and `OFFSET` for pagination
   - Filter by indexed columns (`status`, `created_at`)
   - Avoid `SELECT *` in list views (select specific columns)

3. **Expected Load**:
   - 3,000 inquiries/month (~100/day)
   - Read-heavy workload (10:1 read:write ratio)
   - Indexes sufficient for this scale

## Backup & Retention

- **Retention**: Indefinite (per FR-032)
- **Deletion**: Admin-controlled only (per FR-033)
- **Backup**: Supabase automatic daily backups
- **GDPR**: Support manual deletion via admin panel (future enhancement)

---

**Next**: Generate API contracts in `contracts/` directory
