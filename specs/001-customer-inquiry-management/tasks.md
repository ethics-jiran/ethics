# Tasks: Customer Inquiry Management System

**Feature**: Customer Inquiry Management System
**Branch**: `001-customer-inquiry-management`
**Date**: 2025-10-02
**Input**: [plan.md](./plan.md)

## Overview

This document contains dependency-ordered implementation tasks. Tasks marked with **[P]** can be executed in parallel with adjacent **[P]** tasks.

**Total Tasks**: 34
**Estimated Effort**: ~2-3 days

## Task Categories
- **Setup & Infrastructure** (T001-T010): 10 tasks
- **Validation & Backend** (T011-T020): 10 tasks
- **UI Components** (T021-T030): 10 tasks
- **Deployment & Documentation** (T031-T034): 4 tasks

## Using MCP Servers

This project uses **Model Context Protocol (MCP)** for AI-assisted development. The following MCP servers are configured in `.mcp.json`:

### 1. shadcn MCP - Component Management
**Purpose**: AI-assisted UI component installation and discovery

**Natural Language Commands**:
- "Add button, form, and input components from shadcn"
- "Search for dashboard blocks in shadcn registry"
- "Show me examples of login forms"
- "Run audit checklist for installed components"

### 2. Supabase MCP - Database Management
**Purpose**: Manage Supabase database, migrations, and queries
**Project**: `domjuxvrnglsohyqdzmi`

**Natural Language Commands**:
- "Show me all tables in Supabase"
- "Create a migration for inquiries table"
- "Query inquiries where status is pending"
- "Show RLS policies for inquiries"
- "Generate TypeScript types from current schema"

**Use Cases**:
- T006-T008: Database migration creation and management
- T009: Type generation from schema
- Development: Query and verify data during implementation
- Debugging: Inspect database state

### 3. Chrome DevTools MCP - Browser Testing
**Purpose**: Automated browser interaction for manual testing and verification

**Natural Language Commands**:
- "Open http://localhost:3000 and take a screenshot"
- "Navigate to /inquiry and fill out the form"
- "Click the submit button and wait for response"
- "Check console for errors"
- "Take screenshot of /admin/inquiries page"

**Use Cases**:
- T033: Production verification
- Manual testing during development
- Visual debugging
- Debugging UI issues

### 4. Context7 MCP - Documentation & Research
**Purpose**: Search and retrieve up-to-date library documentation

**Natural Language Commands**:
- "Find Next.js 15 App Router documentation"
- "Search for Supabase Auth TOTP examples"
- "Get latest Zod validation patterns"
- "Show React Hook Form integration guide"
- "Find Resend email API examples"

**Use Cases**:
- Research during implementation
- Finding best practices
- Checking latest API changes
- Example code discovery

## MCP Best Practices

1. **Use natural language** - Don't memorize commands, just describe what you need
2. **Combine MCP servers** - Use Context7 for research, then shadcn to add components
3. **Verify with MCP** - Use Chrome DevTools to test, Supabase MCP to check data
4. **Iterative development** - Ask MCP for examples, implement, test with MCP

## MCP Workflow Example

**Scenario**: Implementing T021 (Inquiry Form Component)

1. **Research** (Context7 MCP):
   ```
   "Find React Hook Form with Zod integration examples"
   "Search for form validation best practices"
   ```

2. **Component Discovery** (shadcn MCP):
   ```
   "Search for form components in shadcn registry"
   "Show me examples of contact forms"
   ```

3. **Implementation**:
   Write the component using gathered examples

4. **Manual Testing** (Chrome DevTools MCP):
   ```
   "Open http://localhost:3000/inquiry"
   "Fill form with test data and submit"
   "Take screenshot of success state"
   "Check console for errors"
   ```

5. **Data Verification** (Supabase MCP):
   ```
   "Query inquiries to verify form submission"
   "Check if validation constraints are working"
   ```

6. **Refinement**:
   Fix issues found in steps 4-5, repeat

**MCP is available in**: Claude Code, Cursor, VS Code with GitHub Copilot

---

## Phase 1: Setup & Infrastructure (T001-T010)

### T001: Initialize Next.js Project
**File**: `package.json`, `tsconfig.json`
**Description**: Create Next.js 15 application with TypeScript and Tailwind in src/ directory
**Dependencies**: None
**Acceptance**:
- [ ] Next.js 15 app created with App Router in `src/app/`
- [ ] TypeScript configured with strict mode
- [ ] Tailwind CSS installed
- [ ] `pnpm dev` runs successfully at localhost:3000
- [ ] `.env.local` file created
- [ ] `src/` directory structure created

**Commands**:
```bash
npx create-next-app@latest cherish --typescript --tailwind --app
cd cherish
pnpm install
```

**Verify**:
```bash
pnpm dev
# Visit http://localhost:3000
```

**Expected Structure**:
```
cherish/
├── src/
│   └── app/
├── package.json
└── next.config.js
```

---

### T002: Setup Supabase Local Development
**File**: `supabase/config.toml`
**Description**: Initialize local Supabase instance
**Dependencies**: None
**Acceptance**:
- [ ] Supabase CLI installed
- [ ] `supabase init` completed
- [ ] `supabase start` runs successfully
- [ ] Local API URL and keys captured
- [ ] `.env.local` created with Supabase credentials

**Commands**:
```bash
supabase init
supabase start
# Save output to .env.local
```

**`.env.local` Template**:
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
RESEND_API_KEY=<resend-key>
```

---

### T003: Configure shadcn/ui with Orange Theme
**File**: `components.json`
**Description**: Initialize shadcn/ui and configure Orange theme using MCP
**Dependencies**: T001
**Acceptance**:
- [ ] shadcn/ui initialized (`npx shadcn@latest init`)
- [ ] Orange base color selected
- [ ] CSS variables configured
- [ ] Tailwind config updated
- [ ] `src/components/ui/` directory created
- [ ] MCP server can access project registries

**Commands**:
```bash
npx shadcn@latest init
# Choose:
#   - Style: Default
#   - Color: Orange
#   - CSS variables: Yes
#   - Components location: src/components
```

**Alternative (using AI with MCP)**:
Ask Claude Code: "Initialize shadcn/ui with Orange theme in src/components"

**Verify MCP Setup**:
```bash
# Check if registries are accessible
# AI can now use natural language like:
# "Show me available components in shadcn registry"
```

---

### T004: Install shadcn/ui Components
**File**: `src/components/ui/`
**Description**: Add required shadcn components using MCP
**Dependencies**: T003
**Acceptance**:
- [ ] dashboard-01 block added
- [ ] login-05 block added
- [ ] Core components added: button, form, input, textarea, table, dialog, badge, select, toast, card, label
- [ ] All components in `src/components/ui/`
- [ ] Components validated using MCP audit

**Method 1 - Manual Commands**:
```bash
npx shadcn@latest add dashboard-01
npx shadcn@latest add login-05
npx shadcn@latest add button form input textarea table dialog badge select toast card label
```

**Method 2 - Using AI with MCP (Recommended)**:
Ask Claude Code:
```
"Add the following shadcn components to my project:
- dashboard-01 block
- login-05 block
- button, form, input, textarea, table, dialog, badge, select, toast, card, label"
```

**Or ask individually**:
```
"Search for dashboard blocks in shadcn registry"
"Show me examples of login forms from shadcn"
"Add button, form, and input components"
```

**Verify Installation**:
Ask Claude Code: "Run audit checklist for shadcn components"

---

### T005: Install Project Dependencies
**File**: `package.json`
**Description**: Install all required npm packages
**Dependencies**: T001
**Acceptance**:
- [ ] Supabase client installed
- [ ] Form libraries installed (react-hook-form, zod)
- [ ] SWR installed
- [ ] All dependencies in package.json

**Commands**:
```bash
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add react-hook-form @hookform/resolvers/zod zod
pnpm add swr
pnpm add lucide-react
pnpm add -D @types/node typescript
```

---

### T006: Create Database Schema Migration
**File**: `supabase/migrations/001_create_inquiries.sql`
**Description**: Create SQL migration for inquiries table
**Dependencies**: T002
**Acceptance**:
- [ ] Migration file created
- [ ] Table structure matches data-model.md
- [ ] Indexes created (email+auth_code, status, created_at)
- [ ] Triggers created (updated_at auto-update)
- [ ] Constraints added (email format, status enum, length limits)

**Using Supabase MCP**:
Ask Claude Code:
- "Show me existing tables in Supabase project domjuxvrnglsohyqdzmi"
- "Create a migration for inquiries table with the following schema..."
- "Verify the migration syntax is correct"

**Using Context7 MCP**:
Ask Claude Code:
- "Search for Supabase PostgreSQL CHECK constraint examples"
- "Find Supabase trigger function documentation"

**SQL Schema** (from data-model.md:143-181):
```sql
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
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_inquiries_email_auth ON inquiries(email, auth_code);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created ON inquiries(created_at DESC);

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

---

### T007: Create RLS Policies Migration
**File**: `supabase/migrations/002_create_rls_policies.sql`
**Description**: Enable Row Level Security and create policies
**Dependencies**: T006
**Acceptance**:
- [ ] RLS enabled on inquiries
- [ ] Admin policy created (requires aal2)
- [ ] Policies tested with local Supabase

**SQL** (from data-model.md:172-187):
```sql
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access with MFA"
ON inquiries
FOR ALL
TO authenticated
USING ((SELECT auth.jwt()->>'aal') = 'aal2');
```

---

### T008: Apply Database Migrations
**File**: N/A (command execution)
**Description**: Run migrations against local Supabase
**Dependencies**: T007
**Acceptance**:
- [ ] `supabase db reset` completes successfully
- [ ] inquiries table exists
- [ ] RLS policies active
- [ ] Indexes created

**Commands**:
```bash
supabase db reset
```

---

### T009: Generate TypeScript Database Types
**File**: `src/types/database.ts`
**Description**: Auto-generate TypeScript types from Supabase schema
**Dependencies**: T008
**Acceptance**:
- [ ] Types generated successfully
- [ ] `Database` type exported
- [ ] `inquiries` Row/Insert/Update types available
- [ ] No TypeScript errors
- [ ] File created in `src/types/`

**Method 1 - Manual Command**:
```bash
mkdir -p src/types
supabase gen types typescript --local > src/types/database.ts
```

**Method 2 - Using Supabase MCP**:
Ask Claude Code:
- "Generate TypeScript types from Supabase schema for project domjuxvrnglsohyqdzmi"
- "Show me the structure of inquiries table types"
- "Verify all database types are correctly generated"

---

### T010: Setup Supabase Client Utilities
**Files**:
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`

**Description**: Create Supabase client helpers for browser/server (Data Access Layer)
**Dependencies**: T009
**Acceptance**:
- [ ] Browser client created (uses anon key)
- [ ] Server client created (SSR support)
- [ ] Middleware created (auth check)
- [ ] Type-safe clients using Database type
- [ ] Files in `src/lib/supabase/`

**Example** (`client.ts`):
```typescript
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

---

## Phase 2: Validation & Backend (T011-T020)

### T011: Create Validation Schemas
**File**: `src/lib/validations/inquiry.ts`
**Description**: Define Zod schemas for all API operations (Shared Layer)
**Dependencies**: T009
**Acceptance**:
- [ ] createInquirySchema defined (title, content, email, name, phone?)
- [ ] verifyInquirySchema defined (email, authCode)
- [ ] sendReplySchema defined (replyTitle, replyContent, status?)
- [ ] updateStatusSchema defined (status enum)
- [ ] All schemas export TypeScript types

**Using Context7 MCP for Best Practices**:
Ask Claude Code:
- "Find latest Zod validation patterns and best practices"
- "Search for Zod email validation examples"
- "Get Zod string length validation syntax"

**Schema** (from data-model.md:226-262):
```typescript
import { z } from 'zod';

export const createInquirySchema = z.object({
  title: z.string().min(1, 'Title required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content required').max(5000, 'Content too long'),
  email: z.string().email('Invalid email'),
  name: z.string().min(1, 'Name required'),
  phone: z.string().optional(),
});

export const verifyInquirySchema = z.object({
  email: z.string().email(),
  authCode: z.string().length(6, 'Code must be 6 characters').toUpperCase(),
});

export const sendReplySchema = z.object({
  replyTitle: z.string().min(1, 'Reply title required'),
  replyContent: z.string().min(1, 'Reply content required'),
  status: z.enum(['pending', 'processing', 'completed']).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed']),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
export type VerifyInquiryInput = z.infer<typeof verifyInquirySchema>;
export type SendReplyInput = z.infer<typeof sendReplySchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
```

---

### T012: Implement POST /api/inquiries
**File**: `src/app/api/inquiries/route.ts`
**Description**: Create inquiry submission API endpoint (Backend Layer)
**Dependencies**: T011
**Acceptance**:
- [ ] Validates request body with createInquirySchema
- [ ] Generates 6-character alphanumeric auth code
- [ ] Inserts inquiry into inquiries table
- [ ] Triggers send-auth-code Edge Function
- [ ] Returns 201 with inquiry ID
- [ ] Handles errors (400, 500)

**Implementation**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createInquirySchema } from '@/lib/validations/inquiry';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createInquirySchema.parse(body);

    // Generate 6-char auth code
    const authCode = Array.from({ length: 6 }, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
    ).join('');

    const supabase = createClient();

    const { data, error } = await supabase
      .from('inquiries')
      .insert({
        ...validated,
        auth_code: authCode,
      })
      .select('id, auth_code')
      .single();

    if (error) throw error;

    // Trigger email Edge Function
    await supabase.functions.invoke('send-auth-code', {
      body: {
        email: validated.email,
        authCode: data.auth_code,
        inquiryId: data.id,
      },
    });

    return NextResponse.json(
      {
        id: data.id,
        message: 'Inquiry submitted successfully. Check your email for verification code.',
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

### T013: Implement POST /api/inquiries/verify
**File**: `src/app/api/inquiries/verify/route.ts`
**Description**: Create verification and retrieval endpoint (Backend Layer)
**Dependencies**: T011
**Acceptance**:
- [ ] Validates request body with verifyInquirySchema
- [ ] Queries inquiries with email + auth_code
- [ ] Returns inquiry details (excludes auth_code from response)
- [ ] Returns 401 for invalid credentials
- [ ] Returns 404 if not found

**Implementation**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyInquirySchema } from '@/lib/validations/inquiry';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, authCode } = verifyInquirySchema.parse(body);

    const supabase = createClient();

    const { data, error } = await supabase
      .from('inquiries')
      .select('id, title, content, email, name, phone, status, created_at, reply_title, reply_content, replied_at')
      .eq('email', email)
      .eq('auth_code', authCode.toUpperCase())
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Invalid email or verification code' },
        { status: 401 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

### T014: Implement GET /api/admin/inquiries
**File**: `src/app/api/admin/inquiries/route.ts`
**Description**: Create admin inquiry list endpoint with filters (Backend Layer)
**Dependencies**: T011, T010
**Acceptance**:
- [ ] Requires authenticated session with aal2
- [ ] Accepts query params: status, search, limit, offset
- [ ] Returns paginated results with total count
- [ ] Filters by status if provided
- [ ] Searches title/name/email if search provided
- [ ] Returns 401 if unauthenticated
- [ ] Returns 403 if MFA not completed (aal1)

**Implementation**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();

  // Check auth and MFA
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check AAL level (requires MFA)
  const aal = session.user.aal;
  if (aal !== 'aal2') {
    return NextResponse.json(
      { error: 'MFA required - please complete two-factor authentication' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabase
    .from('inquiries')
    .select('id, title, email, name, status, created_at, reply_title', { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({
    data: data.map(item => ({ ...item, hasReply: !!item.reply_title })),
    total: count || 0,
    limit,
    offset,
  });
}
```

---

### T015: Implement GET /api/admin/inquiries/[id]
**File**: `src/app/api/admin/inquiries/[id]/route.ts`
**Description**: Create admin inquiry detail endpoint (Backend Layer)
**Dependencies**: T011, T010
**Acceptance**:
- [ ] Requires authenticated session with aal2
- [ ] Returns full inquiry details including auth_code
- [ ] Returns 404 if inquiry not found
- [ ] Returns 401/403 for auth failures

---

### T016: Implement PATCH /api/admin/inquiries/[id]
**File**: `src/app/api/admin/inquiries/[id]/route.ts`
**Description**: Create admin reply/update endpoint (Backend Layer)
**Dependencies**: T011, T010
**Acceptance**:
- [ ] Requires authenticated session with aal2
- [ ] Validates request with sendReplySchema OR updateStatusSchema
- [ ] Updates inquiry with reply and/or status
- [ ] Sets replied_at and replied_by when reply provided
- [ ] Triggers send-reply-email Edge Function when reply sent
- [ ] Returns updated inquiry + emailSent boolean

**Implementation**:
```typescript
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  // Check auth (same as GET)
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || session.user.aal !== 'aal2') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Validate either reply or status update
  let updateData: any = {};
  let shouldSendEmail = false;

  if (body.replyTitle && body.replyContent) {
    const validated = sendReplySchema.parse(body);
    updateData = {
      reply_title: validated.replyTitle,
      reply_content: validated.replyContent,
      replied_at: new Date().toISOString(),
      replied_by: session.user.id,
    };
    if (validated.status) {
      updateData.status = validated.status;
    }
    shouldSendEmail = true;
  } else if (body.status) {
    const validated = updateStatusSchema.parse(body);
    updateData = { status: validated.status };
  } else {
    return NextResponse.json(
      { error: 'Either reply or status update required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('inquiries')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
  }

  let emailSent = false;
  if (shouldSendEmail) {
    const { error: emailError } = await supabase.functions.invoke('send-reply-email', {
      body: {
        email: data.email,
        inquiryId: data.id,
        replyTitle: data.reply_title,
        replyContent: data.reply_content,
      },
    });
    emailSent = !emailError;
  }

  return NextResponse.json({ data, emailSent });
}
```

---

### T017: Create Edge Function - send-auth-code
**File**: `supabase/functions/send-auth-code/index.ts`
**Description**: Supabase Edge Function for sending verification emails
**Dependencies**: T002
**Acceptance**:
- [ ] Function receives email, authCode, inquiryId
- [ ] Uses Resend API to send email
- [ ] Email includes auth code and inquiry link
- [ ] Returns success/failure status
- [ ] Handles Resend API errors gracefully

**Using Context7 MCP for Research**:
Ask Claude Code:
- "Find Supabase Edge Functions with Resend examples"
- "Search for Resend API email sending patterns"
- "Get Deno fetch API documentation"
- "Find email template best practices"

**Implementation**:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { email, authCode, inquiryId } = await req.json();

  const resendApiKey = Deno.env.get('RESEND_API_KEY');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: 'Cherish Support <noreply@cherish.com>',
      to: [email],
      subject: 'Your Inquiry Verification Code',
      html: `
        <h1>Thank you for your inquiry</h1>
        <p>Your verification code is: <strong>${authCode}</strong></p>
        <p>Use this code to check your inquiry status.</p>
        <p><a href="https://cherish.com/inquiry/check">Check Status</a></p>
      `,
    }),
  });

  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Email delivery failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

---

### T018: Create Edge Function - send-reply-email
**File**: `supabase/functions/send-reply-email/index.ts`
**Description**: Supabase Edge Function for sending admin reply emails
**Dependencies**: T002
**Acceptance**:
- [ ] Function receives email, inquiryId, replyTitle, replyContent
- [ ] Uses Resend API to send email
- [ ] Email includes reply and link to view full inquiry
- [ ] Returns success/failure status

**Implementation**: Similar to T017, but with reply content template

---

### T019: Deploy Edge Functions to Local Supabase
**File**: N/A (command execution)
**Description**: Deploy Edge Functions to local instance for testing
**Dependencies**: T017, T018
**Acceptance**:
- [ ] `supabase functions deploy send-auth-code --no-verify-jwt` succeeds
- [ ] `supabase functions deploy send-reply-email --no-verify-jwt` succeeds
- [ ] Functions invocable from API routes
- [ ] Email delivery tested (Resend test mode)

**Commands**:
```bash
supabase functions deploy send-auth-code --no-verify-jwt
supabase functions deploy send-reply-email --no-verify-jwt
```

---

### T020: Create Test Admin User with MFA
**File**: `scripts/setup-test-admin.ts`
**Description**: Script to create admin user with TOTP enrolled
**Dependencies**: T008, T010
**Acceptance**:
- [ ] Script creates admin@test.com user
- [ ] Enrolls TOTP factor
- [ ] Outputs QR code for authenticator app
- [ ] Verifies MFA enrollment
- [ ] Admin can login with MFA

**Script**:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setupAdmin() {
  // Create user
  const { data: { user } } = await supabase.auth.admin.createUser({
    email: 'admin@test.com',
    password: 'Test123!@#',
    email_confirm: true,
  });

  console.log('Admin user created:', user?.id);

  // Login to enroll MFA
  const { data: { session } } = await supabase.auth.signInWithPassword({
    email: 'admin@test.com',
    password: 'Test123!@#',
  });

  // Enroll TOTP
  const { data: mfa } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
  });

  console.log('Scan this QR code:', mfa?.totp.qr_code);
  console.log('Or use secret:', mfa?.totp.secret);

  // Manual verification step required
  console.log('\nEnter code from authenticator app to complete setup');
}

setupAdmin();
```

---

## Phase 3: UI Components (T021-T030)

### T021: Create Inquiry Form Component
**File**: `src/components/forms/inquiry-form.tsx`
**Description**: Customer inquiry submission form (Presentation Layer)
**Dependencies**: T004, T011
**Acceptance**:
- [ ] Uses shadcn/ui form components
- [ ] Integrates react-hook-form + Zod
- [ ] Client-side validation matches createInquirySchema
- [ ] Submits to POST /api/inquiries
- [ ] Displays success message with instructions
- [ ] Displays validation errors

**Using MCP for Examples**:
Ask Claude Code: "Show me examples of contact forms from shadcn registry"

**Component Structure**:
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createInquirySchema, type CreateInquiryInput } from '@/lib/validations/inquiry';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

export function InquiryForm() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<CreateInquiryInput>({
    resolver: zodResolver(createInquirySchema),
    defaultValues: {
      title: '',
      content: '',
      email: '',
      name: '',
      phone: '',
    },
  });

  const onSubmit = async (data: CreateInquiryInput) => {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="p-6 bg-green-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Inquiry Submitted</h2>
        <p>Check your email for a verification code to view your inquiry status.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Brief subject" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your inquiry..." rows={6} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="+1-555-123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
        </Button>
      </form>
    </Form>
  );
}
```

---

### T022: Create Inquiry Verification Component
**File**: `src/components/forms/inquiry-check-form.tsx`
**Description**: Customer inquiry verification and status check form (Presentation Layer)
**Dependencies**: T004, T011
**Acceptance**:
- [ ] Uses shadcn/ui form components
- [ ] Validates email + auth code
- [ ] Calls POST /api/inquiries/verify
- [ ] Displays inquiry details on success
- [ ] Shows reply if available
- [ ] Displays error for invalid credentials

---

### T023: Create Admin Login Form Component
**File**: `src/components/forms/admin-login-form.tsx`
**Description**: Admin login with TOTP 2FA (Presentation Layer)
**Dependencies**: T004, T010
**Acceptance**:
- [ ] Uses login-05 shadcn block
- [ ] Email/password step
- [ ] TOTP verification step
- [ ] Calls Supabase Auth APIs
- [ ] Redirects to /admin/inquiries on success

**Using MCP for Examples**:
Ask Claude Code:
- "Show me the login-05 block implementation"
- "Find examples of authentication forms with 2FA"

**Component Structure**:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Login failed');
      return;
    }

    // Get MFA factors
    const { data: factors } = await supabase.auth.mfa.listFactors();
    if (factors && factors.totp.length > 0) {
      const factor = factors.totp[0];
      setFactorId(factor.id);

      // Create MFA challenge
      const { data: challenge } = await supabase.auth.mfa.challenge({
        factorId: factor.id,
      });

      setChallengeId(challenge!.id);
      setStep('mfa');
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: totpCode,
    });

    if (error) {
      alert('Invalid code');
      return;
    }

    // Redirect to admin panel
    router.push('/admin/inquiries');
  };

  if (step === 'mfa') {
    return (
      <form onSubmit={handleMfaVerify} className="space-y-4">
        <div>
          <Label>Enter Code from Authenticator App</Label>
          <Input
            type="text"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
            placeholder="123456"
            maxLength={6}
          />
        </div>
        <Button type="submit">Verify</Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
        />
      </div>
      <div>
        <Label>Password</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit">Login</Button>
    </form>
  );
}
```

---

### T024: Create Admin Dashboard Layout
**File**: `src/app/admin/layout.tsx`
**Description**: Admin panel layout using dashboard-01 block (Presentation Layer)
**Dependencies**: T004
**Acceptance**:
- [ ] Uses dashboard-01 shadcn block
- [ ] Sidebar with navigation
- [ ] Header with user info
- [ ] Auth middleware applied
- [ ] Logout functionality

**Using MCP for Examples**:
Ask Claude Code: "Show me the dashboard-01 block structure and usage examples"

---

### T025: Create Inquiry Table Component
**File**: `src/components/tables/inquiry-table.tsx`
**Description**: Admin inquiry list table with filters (Presentation Layer)
**Dependencies**: T004, T010
**Acceptance**:
- [ ] Uses shadcn Table component
- [ ] Displays: title, name, email, status, created date
- [ ] Status filter dropdown (all, pending, processing, completed)
- [ ] Search input (title, name, email)
- [ ] Pagination controls
- [ ] Fetches from GET /api/admin/inquiries
- [ ] Clickable rows navigate to detail page

**Using MCP for Examples**:
Ask Claude Code:
- "Search for data table examples in shadcn registry"
- "Show me table components with filtering and pagination"

**Component Structure**:
```typescript
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

type Status = 'pending' | 'processing' | 'completed' | 'all';

export function InquiryTable() {
  const [status, setStatus] = useState<Status>('all');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;
  const router = useRouter();

  const queryParams = new URLSearchParams();
  if (status !== 'all') queryParams.set('status', status);
  if (search) queryParams.set('search', search);
  queryParams.set('limit', limit.toString());
  queryParams.set('offset', offset.toString());

  const { data, isLoading } = useSWR(
    `/api/admin/inquiries?${queryParams}`,
    (url) => fetch(url).then(r => r.json())
  );

  const handleRowClick = (id: string) => {
    router.push(`/admin/inquiries/${id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search title, name, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Reply</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data?.map((inquiry: any) => (
            <TableRow
              key={inquiry.id}
              onClick={() => handleRowClick(inquiry.id)}
              className="cursor-pointer hover:bg-muted"
            >
              <TableCell>{inquiry.title}</TableCell>
              <TableCell>{inquiry.name}</TableCell>
              <TableCell>{inquiry.email}</TableCell>
              <TableCell>
                <Badge variant={
                  inquiry.status === 'completed' ? 'default' :
                  inquiry.status === 'processing' ? 'secondary' : 'outline'
                }>
                  {inquiry.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(inquiry.created_at).toLocaleDateString()}</TableCell>
              <TableCell>{inquiry.hasReply ? '✓' : ''}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center">
        <div>
          Showing {offset + 1}-{Math.min(offset + limit, data?.total || 0)} of {data?.total || 0}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setOffset(offset + limit)}
            disabled={offset + limit >= (data?.total || 0)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

### T026: Create Inquiry Detail Panel Component
**File**: `src/components/panels/inquiry-detail-panel.tsx`
**Description**: Display full inquiry details (Presentation Layer)
**Dependencies**: T004
**Acceptance**:
- [ ] Displays all inquiry fields
- [ ] Shows customer info
- [ ] Shows existing reply if present
- [ ] Formatted dates and content

---

### T027: Create Reply Form Panel Component
**File**: `src/components/forms/reply-form.tsx`
**Description**: Admin reply form (Presentation Layer)
**Dependencies**: T004, T011
**Acceptance**:
- [ ] Reply title and content inputs
- [ ] Status dropdown (optional update)
- [ ] Validates with sendReplySchema
- [ ] Calls PATCH /api/admin/inquiries/{id}
- [ ] Shows success/error messages
- [ ] Revalidates inquiry detail on success

---

### T028: Create Inquiry Pages (Customer)
**Files**:
- `src/app/inquiry/page.tsx`
- `src/app/inquiry/check/page.tsx`

**Description**: Customer-facing pages for inquiry submission and checking (Presentation Layer)
**Dependencies**: T021, T022
**Acceptance**:
- [ ] /inquiry page renders InquiryForm
- [ ] /inquiry/check page renders InquiryCheckForm
- [ ] Proper page metadata (title, description)
- [ ] Responsive layout

---

### T029: Create Admin Pages
**Files**:
- `src/app/admin/inquiries/page.tsx`
- `src/app/admin/inquiries/[id]/page.tsx`

**Description**: Admin panel pages (Presentation Layer)
**Dependencies**: T024, T025, T026, T027
**Acceptance**:
- [ ] /admin/inquiries page renders InquiryTable
- [ ] /admin/inquiries/{id} page renders detail + reply panels
- [ ] Auth middleware applied
- [ ] Proper error handling (404, 401, 403)

**Detail Page Structure**:
```typescript
import { InquiryDetailPanel } from '@/components/panels/inquiry-detail-panel';
import { ReplyForm } from '@/components/forms/reply-form';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function InquiryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: inquiry, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !inquiry) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <InquiryDetailPanel inquiry={inquiry} />
      <ReplyForm inquiryId={params.id} />
    </div>
  );
}
```

---

### T030: Create Admin Login Page
**File**: `src/app/(auth)/login/page.tsx`
**Description**: Admin login page (Presentation Layer)
**Dependencies**: T023
**Acceptance**:
- [ ] Uses login-05 shadcn block layout
- [ ] Renders AdminLoginForm
- [ ] Redirects to /admin/inquiries if already authenticated

---

## Phase 4: Deployment & Documentation (T031-T034)

### T031: Configure Production Environment Variables
**File**: `.env.production` (not committed)
**Description**: Set up production Supabase and Resend credentials
**Dependencies**: T001, T002
**Acceptance**:
- [ ] Supabase Cloud project created
- [ ] Production database URL set
- [ ] Production anon key set
- [ ] Service role key securely stored
- [ ] Resend production API key configured

**Steps**:
1. Create Supabase Cloud project at https://supabase.com
2. Push migrations: `supabase db push`
3. Deploy Edge Functions: `supabase functions deploy send-auth-code` and `send-reply-email`
4. Add environment variables to Vercel project settings

---

### T032: Deploy to Vercel
**File**: N/A (deployment)
**Description**: Deploy Next.js app to Vercel
**Dependencies**: T031
**Acceptance**:
- [ ] Vercel project created (connect GitHub repo)
- [ ] Environment variables configured in Vercel dashboard
- [ ] Build succeeds
- [ ] Production deployment URL accessible
- [ ] All environment variables working in production

**Steps**:
1. Install Vercel CLI: `pnpm add -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`
4. Or push to GitHub main branch for auto-deployment

**Alternative (GitHub Integration)**:
1. Go to https://vercel.com/new
2. Import GitHub repository
3. Add environment variables in project settings
4. Deploy automatically on push to main

---

### T033: Test Production Environment
**File**: N/A (manual testing)
**Description**: Smoke test production deployment
**Dependencies**: T032
**Acceptance**:
- [ ] Customer inquiry submission works
- [ ] Email delivery works (auth code received)
- [ ] Inquiry verification works
- [ ] Admin login with MFA works
- [ ] Admin reply works
- [ ] Reply email delivered
- [ ] Performance meets goals (<200ms API, <1s page load)

**Method 1 - Manual Testing Checklist**:
1. Submit test inquiry from external site
2. Check email for auth code
3. Verify inquiry with code
4. Login as admin with TOTP
5. View inquiry list
6. Open inquiry detail
7. Send reply
8. Check customer email for reply

**Method 2 - Using Chrome DevTools MCP (Recommended)**:
Ask Claude Code to automate smoke tests:
```
"Open https://cherish-jiran.vercel.app/inquiry"
"Fill out inquiry form with test data and submit"
"Take screenshot of success message"
"Navigate to https://cherish-jiran.vercel.app/inquiry/check"
"Verify inquiry with email and auth code"
"Take screenshot of inquiry status"
"Check console for any errors"
"Navigate to https://cherish-jiran.vercel.app/admin"
"Take screenshot of login page"
"Navigate to /admin/inquiries and screenshot the table"
```

**Using Supabase MCP for Data Verification**:
After production testing, verify data:
Ask Claude Code:
- "Query inquiries in production to verify test inquiry was created"
- "Check if auth_code matches what was sent in email"
- "Verify admin reply was saved correctly"

**Performance Check with Chrome DevTools MCP**:
- "Navigate to production site and check performance metrics"
- "Take screenshot of Network tab showing API response times"

---

### T034: Update Documentation and Handoff
**File**: `README.md`
**Description**: Final documentation updates
**Dependencies**: T033
**Acceptance**:
- [ ] README.md updated with deployment info
- [ ] API documentation linked (contracts/)
- [ ] Admin setup instructions documented
- [ ] External integration guide created
- [ ] Environment variable reference complete

**README.md Structure**:
```markdown
# Cherish - Customer Inquiry Management System

## Features
- Customer inquiry submission via API
- Email verification system
- Admin panel with TOTP 2FA
- Inquiry management and responses

## Tech Stack
- Next.js 15 (App Router)
- Supabase (PostgreSQL + Auth + Edge Functions)
- shadcn/ui (Orange theme)
- Resend (Email delivery)
- Vercel (Deployment)

## Quick Start
See [quickstart.md](./specs/001-customer-inquiry-management/quickstart.md)

## API Documentation
- [Inquiry API](./specs/001-customer-inquiry-management/contracts/inquiries.yaml)
- [Admin API](./specs/001-customer-inquiry-management/contracts/admin.yaml)

## Deployment
Production: https://cherish.vercel.app
Admin: https://cherish.vercel.app/admin

## External Integration
```javascript
const response = await fetch('https://cherish.vercel.app/api/inquiries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Question about product',
    content: 'I would like to know...',
    email: 'customer@example.com',
    name: 'John Doe',
  }),
});
```
```

---

## Task Execution Order (Optimized for Parallelization)

**Day 1**:
- T001-T010: Infrastructure setup (sequential, ~3 hours)
- T011-T020: Backend implementation (sequential, ~4 hours)

**Day 2**:
- T021-T030: UI components (can parallelize T021-T023, T024-T027, T028-T030, ~6 hours)

**Day 3**:
- T031-T034: Deployment, documentation (~3 hours)

---

## Dependencies Graph Summary

```
T001 → T003 → T004 → T021, T022, T023, T024, T025, T026, T027
T001 → T005
T002 → T006 → T007 → T008 → T009 → T010 → T012, T013, T014, T015, T016
T002 → T017, T018 → T019
T008, T010 → T015, T016, T017, T018, T020
T004, T010 → T023, T024
T004, T011 → T021, T022, T025, T026, T027
T021, T022 → T028
T023, T024, T025, T026, T027 → T029, T030
T001-T030 → T031 → T032 → T033 → T034
```

---

**Ready for implementation!** Start with T001-T010, then proceed in dependency order.
