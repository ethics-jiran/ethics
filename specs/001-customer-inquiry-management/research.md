# Research: Customer Inquiry Management System

**Date**: 2025-10-02
**Feature**: Customer Inquiry Management System
**Branch**: `001-customer-inquiry-management`

## Research Objectives

This document consolidates research findings for key technology decisions and implementation patterns required for the Customer Inquiry Management System.

## 1. Supabase Integration Best Practices

### 1.1 Supabase Auth with TOTP 2FA

**Decision**: Use Supabase built-in TOTP MFA via `auth.mfa.enroll()` and `auth.mfa.verify()`

**Implementation Pattern**:
```typescript
// Enrollment (admin setup)
const { data } = await supabase.auth.mfa.enroll({
  factorType: 'totp'
});
// Returns: { id, totp: { qr_code, secret, uri } }

// Challenge + Verify (admin login)
const challenge = await supabase.auth.mfa.challenge({ factorId });
const verify = await supabase.auth.mfa.verify({
  factorId,
  challengeId: challenge.data.id,
  code: userInputCode
});
```

**Rationale**:
- Native Supabase support (no external dependencies)
- QR code auto-generated for Google Authenticator/Authy
- JWT includes `aal` (Authenticator Assurance Level) claim for RLS policies
- Supports `aal2` requirement enforcement via RLS

**Alternatives Considered**:
- **SMS via Twilio**: Rejected - additional cost, complexity, not required by spec
- **Email codes**: Rejected - less secure than TOTP, not meeting 2FA standard

### 1.2 Supabase Edge Functions for Email Delivery

**Decision**: Use Supabase Edge Functions (Deno) with Resend API for email delivery

**Implementation Pattern**:
```typescript
// supabase/functions/send-auth-code/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { email, authCode } = await req.json();

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@cherish.com',
      to: email,
      subject: 'Your Inquiry Verification Code',
      html: `Your code: <strong>${authCode}</strong>`,
    }),
  });

  return new Response(JSON.stringify({ success: true }));
});
```

**Rationale**:
- Decouples email logic from Next.js API Routes
- Serverless, scales automatically
- Free tier: 500K requests/month
- Resend provides 100 free emails/day, reliable delivery

**Alternatives Considered**:
- **Native SMTP**: Rejected - requires server management, less reliable
- **SendGrid**: Rejected - Resend has better DX, cheaper for small volume
- **Next.js API Route email**: Rejected - violates SRP, blocks request

### 1.3 Row Level Security (RLS) Policies

**Decision**: Implement RLS policies for admin-only access and customer self-access

**Implementation Pattern**:
```sql
-- Admin full access (requires aal2 for MFA)
CREATE POLICY "Admin full access with MFA"
ON inquiries
FOR ALL
TO authenticated
USING (
  (SELECT auth.jwt()->>'aal') = 'aal2'
);

-- Customer view-only access (email + auth_code match)
CREATE POLICY "Customer read own inquiry"
ON inquiries
FOR SELECT
TO anon
USING (
  email = current_setting('request.jwt.claims', true)::json->>'email'
  AND auth_code = current_setting('request.jwt.claims', true)::json->>'auth_code'
);
```

**Rationale**:
- Security enforced at database layer (defense in depth)
- Prevents accidental data leaks from client code
- Automatic filtering without application logic
- MFA requirement enforced via `aal` claim

**Alternatives Considered**:
- **Application-level authorization**: Rejected - less secure, easy to bypass
- **Middleware auth checks**: Rejected - doesn't prevent direct SQL injection

### 1.4 Supabase SSR Patterns with Next.js App Router

**Decision**: Use `@supabase/ssr` with separate client/server instances

**Implementation Pattern**:
```typescript
// lib/supabase/client.ts (browser)
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// lib/supabase/server.ts (server components/actions)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) { cookieStore.set({name, value, ...options}); },
        remove(name, options) { cookieStore.set({name, value: '', ...options}); },
      },
    }
  );
}
```

**Rationale**:
- Proper cookie handling for SSR (prevents hydration mismatches)
- Session persistence across page reloads
- Type-safe with auto-generated database types

**Alternatives Considered**:
- **Single client instance**: Rejected - causes SSR/CSR mismatches
- **Direct fetch calls**: Rejected - loses type safety, RLS benefits

---

## 2. Next.js 15 + SST Integration

### 2.1 SST Configuration for Next.js 15 Deployment

**Decision**: Use `sst.aws.Nextjs` construct with Supabase linkable

**Implementation Pattern**:
```typescript
// sst.config.ts
export default $config({
  app(input) {
    return { name: "cherish", removal: "remove" };
  },
  async run() {
    const supabase = new sst.Linkable("Supabase", {
      properties: {
        url: process.env.SUPABASE_URL!,
        anonKey: process.env.SUPABASE_ANON_KEY!,
      },
    });

    const web = new sst.aws.Nextjs("Web", {
      link: [supabase],
      environment: {
        NEXT_PUBLIC_SUPABASE_URL: supabase.properties.url,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: supabase.properties.anon Key,
      },
    });

    return { web: web.url };
  },
});
```

**Rationale**:
- Type-safe environment variables via SST Link
- Automatic CloudFront + Lambda@Edge deployment
- Free SSL, global CDN
- Infrastructure as code (reproducible)

**Alternatives Considered**:
- **Vercel CLI only**: Rejected - less control over infrastructure, vendor lock-in
- **Manual AWS setup**: Rejected - complex, error-prone
- **Terraform**: Rejected - SST provides better Next.js integration

### 2.2 Environment Variable Management with SST Link

**Decision**: Use SST Link for type-safe env vars, SST Resource binding

**Implementation Pattern**:
```typescript
// Access in Next.js code
import { Resource } from "sst";

const supabaseUrl = Resource.Supabase.url; // Type-safe!
```

**Rationale**:
- Compile-time type checking for env vars
- No need for `.env` files in production
- Automatic injection during deployment

**Alternatives Considered**:
- **process.env with string types**: Rejected - no type safety
- **Custom config validation**: Rejected - SST provides this built-in

### 2.3 Type-Safe API Routes in App Router

**Decision**: Use Zod for request/response validation in API routes

**Implementation Pattern**:
```typescript
// lib/validations/inquiry.ts
import { z } from 'zod';

export const createInquirySchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
});

// app/api/inquiries/route.ts
export async function POST(req: Request) {
  const body = await req.json();
  const validated = createInquirySchema.parse(body); // Throws if invalid
  // ... business logic
}
```

**Rationale**:
- Runtime validation + TypeScript inference
- Single source of truth for validation rules
- Auto-generates TypeScript types

**Alternatives Considered**:
- **Manual validation**: Rejected - error-prone, not DRY
- **class-validator**: Rejected - Zod has better Next.js integration

### 2.4 Server Actions vs API Routes Trade-offs

**Decision**: Use API Routes for all mutations (no Server Actions)

**Rationale**:
- **Consistency**: External websites need API endpoints anyway
- **Testing**: Easier to test RESTful endpoints
- **Transparency**: Clear separation between client and server
- **Observability**: Standard HTTP logging/monitoring

**Alternatives Considered**:
- **Server Actions for admin mutations**: Rejected - introduces two patterns
- **Mix both**: Rejected - confusing, harder to maintain

---

## 3. shadcn/ui Setup

### 3.1 Orange Theme Customization

**Decision**: Customize shadcn/ui with orange primary color via Tailwind config

**Implementation Pattern**:
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(24 100% 50%)",      // Orange-500
          foreground: "hsl(0 0% 100%)",     // White text
        },
      },
    },
  },
};
```

**Rationale**:
- shadcn uses CSS variables, easy to override
- Orange chosen per specification
- Maintains accessibility contrast ratios

**Alternatives Considered**:
- **Custom component library**: Rejected - reinventing the wheel
- **Material UI**: Rejected - heavier, not Tailwind-based

### 3.2 dashboard-01 and login-05 Block Integration

**Decision**: Use `npx shadcn@latest add dashboard-01` and `login-05` blocks as starting point

**Implementation Pattern**:
```bash
npx shadcn@latest add dashboard-01
npx shadcn@latest add login-05
```

**Rationale**:
- Pre-built responsive layouts
- Follows shadcn component patterns
- Customizable, not opinionated

**Alternatives Considered**:
- **Build from scratch**: Rejected - time-consuming
- **Template marketplace**: Rejected - usually requires payment, locked-in

### 3.3 Form Handling with React Hook Form + Zod + shadcn

**Decision**: Use React Hook Form with Zod resolver and shadcn Form components

**Implementation Pattern**:
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createInquirySchema } from '@/lib/validations/inquiry';

const form = useForm({
  resolver: zodResolver(createInquirySchema),
  defaultValues: { title: '', content: '', email: '', name: '', phone: '' },
});
```

**Rationale**:
- Type-safe form state
- Automatic validation
- shadcn Form components integrate seamlessly

**Alternatives Considered**:
- **Formik**: Rejected - React Hook Form has better performance
- **Uncontrolled forms**: Rejected - less validation control

---

## 4. Email Delivery

### 4.1 Resend vs Native SMTP

**Decision**: Use Resend API for email delivery

**Pricing**:
- Free: 100 emails/day, 3,000/month
- Pro: $20/month for 50,000 emails
- Expected usage: ~3,000/month (fits free tier)

**Rationale**:
- Simple API (1 endpoint)
- Better deliverability than SMTP
- Email tracking and analytics
- Free tier sufficient for launch

**Alternatives Considered**:
- **SendGrid**: $15/month for 40K emails, more complex setup
- **AWS SES**: Cheaper at scale, but requires warm-up, more config
- **Mailgun**: Similar pricing, less modern DX

### 4.2 Email Template Best Practices

**Decision**: Use inline CSS HTML emails with plain text fallback

**Template Structure**:
```
Subject: [Brief, action-oriented]
Preheader: [Preview text]
HTML Body: [Responsive table layout, inline CSS]
Plain Text: [Readable alternative]
```

**Rationale**:
- Inline CSS ensures compatibility across email clients
- Plain text fallback for accessibility
- Responsive design for mobile

**Alternatives Considered**:
- **MJML**: Rejected - additional build step
- **React Email**: Rejected - overkill for simple templates

### 4.3 Retry Strategies for Failed Email Delivery

**Decision**: Single retry with exponential backoff, then log failure

**Implementation**:
```typescript
async function sendEmailWithRetry(params, maxRetries = 1) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await resend.emails.send(params);
    } catch (error) {
      if (i === maxRetries) {
        await logEmailFailure(error, params);
        throw error;
      }
      await delay(2 ** i * 1000); // 1s, 2s
    }
  }
}
```

**Rationale**:
- Balance reliability and response time
- Admins can manually resend if needed
- Prevents infinite retry loops

**Alternatives Considered**:
- **Queue system (BullMQ)**: Rejected - overkill for v1, added complexity
- **No retries**: Rejected - poor reliability

---

## 5. Testing Strategy

### 5.1 Vitest Configuration for Next.js App Router

**Decision**: Use Vitest with Next.js-compatible config

**Configuration**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './packages/web'),
    },
  },
});
```

**Rationale**:
- Faster than Jest (ESM-native)
- Compatible with Next.js imports
- Better TypeScript support

**Alternatives Considered**:
- **Jest**: Rejected - slower, requires additional config for ESM
- **Node test runner**: Rejected - lacks React testing utilities

### 5.2 Playwright Setup for E2E Testing with Supabase

**Decision**: Use Playwright with test database isolation

**Pattern**:
```typescript
// tests/e2e/setup.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  async authenticatedPage({ page }, use) {
    // Login as admin with test credentials
    await page.goto('/login');
    await page.fill('[name=email]', 'admin@test.com');
    await page.fill('[name=password]', 'test123');
    await page.fill('[name=code]', '123456'); // Test TOTP code
    await page.click('button[type=submit]');
    await use(page);
  },
});
```

**Rationale**:
- Real browser testing
- Tests full user workflows
- Supports parallel execution

**Alternatives Considered**:
- **Cypress**: Rejected - Playwright has better Next.js integration
- **Puppeteer**: Rejected - Playwright has better API

### 5.3 Local Supabase Setup for Integration Testing

**Decision**: Use Supabase CLI with Docker for local dev

**Setup**:
```bash
# Start local Supabase
supabase start

# Run migrations
supabase db reset

# Run tests
npm test
```

**Rationale**:
- Isolated test environment
- Fast, no network calls
- Matches production schema

**Alternatives Considered**:
- **Test against production**: Rejected - risky, slow
- **Mock Supabase**: Rejected - doesn't catch RLS policy issues

### 5.4 Contract Testing Libraries (OpenAPI Validation)

**Decision**: Use `@apidevtools/swagger-parser` + custom validator

**Pattern**:
```typescript
import SwaggerParser from '@apidevtools/swagger-parser';
import { describe, it, expect } from 'vitest';

describe('POST /api/inquiries contract', () => {
  it('matches OpenAPI spec', async () => {
    const spec = await SwaggerParser.validate('./contracts/inquiries.yaml');
    const endpoint = spec.paths['/api/inquiries'].post;

    // Test request matches schema
    const mockRequest = { /* ... */ };
    expect(() => validateAgainstSchema(mockRequest, endpoint.requestBody)).not.toThrow();
  });
});
```

**Rationale**:
- Ensures API matches documented contracts
- Catches breaking changes early
- OpenAPI spec serves as documentation

**Alternatives Considered**:
- **Pact**: Rejected - overkill for monolithic app
- **Manual JSON schema**: Rejected - OpenAPI provides better tooling

---

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **2FA** | Supabase TOTP | Native support, QR code generation, RLS integration |
| **Email** | Resend via Edge Functions | Reliable delivery, free tier, SRP compliance |
| **Database Security** | RLS Policies | Defense in depth, MFA enforcement at DB layer |
| **Infrastructure** | SST + Next.js | Type-safe env vars, IaC, easy deployment |
| **Validation** | Zod everywhere | Runtime + compile-time safety, DRY |
| **API Pattern** | API Routes only | External integration, testability, consistency |
| **UI Framework** | shadcn/ui | Customizable, Tailwind-based, pre-built blocks |
| **Email Provider** | Resend | Free tier, simple API, good deliverability |
| **Testing** | Vitest + Playwright | Fast, modern, Next.js compatible |
| **Local Dev** | Supabase CLI | Isolated, fast, production parity |

---

## Deferred Clarifications (Implementation Defaults)

The following were marked as `[NEEDS CLARIFICATION]` but assigned reasonable defaults:

1. **Title/Content Length**: 200/5000 chars
2. **Retry Limits**: Soft limit (no hard lockout)
3. **Session Timeout**: 24 hours (Supabase default)
4. **Dashboard Period**: Today + all-time stats
5. **Date Filtering**: Basic from/to range
6. **Email Failures**: Log + single retry
7. **SLA/i18n**: Not enforced in v1

These defaults can be adjusted based on usage patterns post-launch.

---

**Next**: Phase 1 - Generate data-model.md, API contracts, and failing tests.
