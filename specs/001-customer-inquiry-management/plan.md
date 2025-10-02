# Implementation Plan: Customer Inquiry Management System

**Branch**: `001-customer-inquiry-management` | **Date**: 2025-10-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-customer-inquiry-management/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → ✅ Loaded successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✅ Web application type detected
   → ✅ Structure Decision: Layered Architecture with Next.js App Router
3. Fill the Constitution Check section based on the content of the constitution document.
   → ✅ Constitution v1.0.0 loaded
4. Evaluate Constitution Check section below
   → ✅ No violations
   → ✅ Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → ✅ Complete
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md
   → ✅ Complete
7. Re-evaluate Constitution Check section
   → ✅ Complete (No new violations)
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
   → ✅ Complete
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 8. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

**Feature**: Customer Inquiry Management System enabling customers to submit support inquiries via external websites and administrators to manage responses through a secure admin panel.

**Technical Approach**:
- **Architecture**: Thin client with server-side business logic
- **Stack**: Next.js 15 (App Router) + Supabase (PostgreSQL + Auth + Edge Functions) + shadcn/ui + Vercel
- **Structure**: Layered Architecture organizing code by technical concerns (presentation, business logic, data access)
- **Authentication**: Supabase Auth with TOTP 2FA for administrators
- **Integration**: REST API for external website inquiry submission
- **Email**: Supabase Edge Functions + Resend for verification codes and response notifications

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 15 (App Router)
**Primary Dependencies**:
- Next.js 15 (App Router, API Routes)
- React 18
- Supabase Client (@supabase/supabase-js, @supabase/ssr)
- shadcn/ui (Orange theme)
- Tailwind CSS
- React Hook Form + Zod (validation)
- SWR (data fetching)
- Resend (Email delivery)

**Storage**: Supabase PostgreSQL with Row Level Security (RLS)

**Target Platform**:
- Vercel (Next.js deployment)
- Supabase Cloud (Database + Auth + Edge Functions)

**Project Type**: Web application (frontend + backend integrated in Next.js)

**Performance Goals**:
- API response time <200ms p95
- Page load <1s on 3G
- Real-time email delivery (<30s for verification codes)

**Constraints**:
- No file attachments (text-only inquiries)
- No rate limiting on inquiry submissions
- TOTP 2FA required for all admin logins
- Indefinite data retention (admin-controlled deletion)

**Scale/Scope**:
- Expected 1000-5000 inquiries/month
- 5-10 administrator users
- 3 inquiry statuses (pending, processing, completed)
- Support for external API integration

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Thin Client Architecture
- ✅ **PASS**: All business logic will reside in Next.js API Routes and Supabase (RLS policies, Edge Functions)
- ✅ **PASS**: React components limited to UI rendering and data fetching
- ✅ **PASS**: No direct database access from client code (using Supabase Client with RLS)
- ✅ **PASS**: Server-side validation via Zod schemas in API routes; client-side validation for UX only

### II. Single Responsibility Principle (SRP)
- ✅ **PASS**: Each API route handles one operation (POST /api/inquiries, GET /api/admin/inquiries, etc.)
- ✅ **PASS**: Components follow SRP (InquiryForm, InquiryTable, ReplyDialog separate concerns)
- ✅ **PASS**: Edge Functions have single purpose (send-auth-code, send-reply-email)

### III. Layered Architecture
- ✅ **PASS**: Code organized by technical concerns:
  - Presentation Layer: `src/app/` (Next.js pages) and `src/components/` (UI components)
  - Business Logic Layer: `src/lib/services/`
  - Data Access Layer: `src/lib/api/` and `src/lib/supabase/`
  - Shared Layer: `src/lib/validations/`, `src/lib/hooks/`, `src/types/`
- ✅ **PASS**: Clear separation between layers
- ✅ **PASS**: Dependencies flow in one direction (app → lib → data)

### IV. Type Safety & Validation
- ✅ **PASS**: Zod schemas for all API requests/responses
- ✅ **PASS**: TypeScript strict mode enabled
- ✅ **PASS**: Database types auto-generated from Supabase schema
- ✅ **PASS**: React Hook Form + Zod for form validation
- ✅ **PASS**: Environment variables validated at runtime

**Result**: ✅ All constitutional requirements satisfied. No violations requiring justification.

## Project Structure

### Documentation (this feature)
```
specs/001-customer-inquiry-management/
├── spec.md              # Feature specification
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   ├── inquiries.yaml   # OpenAPI spec for inquiry endpoints
│   └── admin.yaml       # OpenAPI spec for admin endpoints
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
cherish/
├── src/                             # Next.js application source
│   ├── app/                         # Presentation layer
│   │   ├── api/                     # API Routes (server-side)
│   │   │   ├── inquiries/
│   │   │   │   ├── route.ts         # POST - Submit inquiry
│   │   │   │   └── verify/
│   │   │   │       └── route.ts     # POST - Verify & retrieve inquiry
│   │   │   └── admin/
│   │   │       └── inquiries/
│   │   │           ├── route.ts     # GET - List inquiries
│   │   │           └── [id]/
│   │   │               └── route.ts # GET detail, PATCH reply/status
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx         # Admin login (login-05)
│   │   ├── admin/
│   │   │   ├── layout.tsx           # dashboard-01 layout
│   │   │   ├── page.tsx             # Dashboard
│   │   │   └── inquiries/
│   │   │       ├── page.tsx         # Inquiry list
│   │   │       └── [id]/
│   │   │           └── page.tsx     # Inquiry detail + reply
│   │   └── inquiry/
│   │       ├── page.tsx             # Customer inquiry form
│   │       └── check/
│   │           └── page.tsx         # Customer inquiry verification
│   ├── components/                  # Presentation layer
│   │   ├── forms/
│   │   │   ├── inquiry-form.tsx
│   │   │   ├── inquiry-check-form.tsx
│   │   │   └── login-form.tsx
│   │   ├── tables/
│   │   │   ├── inquiry-table.tsx
│   │   │   └── inquiry-detail-panel.tsx
│   │   ├── cards/
│   │   │   └── stats-cards.tsx
│   │   └── ui/                      # shadcn components
│   ├── lib/                         # Business logic & data access layers
│   │   ├── api/                     # Data access layer
│   │   │   ├── inquiries.ts
│   │   │   └── admin.ts
│   │   ├── services/                # Business logic layer
│   │   │   ├── inquiry.ts
│   │   │   └── auth.ts
│   │   ├── hooks/                   # Presentation logic
│   │   │   ├── use-inquiries.ts
│   │   │   ├── use-inquiry-detail.ts
│   │   │   ├── use-send-reply.ts
│   │   │   └── use-auth.ts
│   │   ├── supabase/                # Data access layer
│   │   │   ├── client.ts            # Browser client
│   │   │   ├── server.ts            # Server client
│   │   │   └── middleware.ts        # Auth middleware
│   │   ├── validations/             # Shared schemas
│   │   │   └── inquiry.ts           # Zod schemas
│   │   └── utils.ts
│   └── types/                       # Shared types
│       └── database.ts              # Auto-generated from Supabase
└── supabase/
    ├── migrations/
    │   ├── 001_create_inquiries.sql
    │   └── 002_create_rls_policies.sql
    └── functions/
        ├── send-auth-code/
        │   └── index.ts
        └── send-reply-email/
            └── index.ts
```

**Structure Decision**: Web application using Next.js App Router with Layered Architecture. Code is organized by technical concerns (presentation, business logic, data access) with clear separation between layers.

## Phase 0: Outline & Research

**Status**: ✅ COMPLETE

### Research Tasks

1. **Supabase Integration Best Practices**
   - Research: Supabase Auth with TOTP 2FA implementation
   - Research: Supabase Edge Functions for email delivery
   - Research: Row Level Security (RLS) policies for multi-tenant data
   - Research: Supabase SSR patterns with Next.js App Router

2. **Next.js 15 + Vercel Deployment**
   - Research: Environment variable management in Vercel
   - Research: Type-safe API routes in App Router
   - Research: Server Actions vs API Routes trade-offs

3. **shadcn/ui Setup**
   - Research: Orange theme customization in shadcn/ui
   - Research: dashboard-01 and login-05 block integration
   - Research: Form handling with React Hook Form + Zod + shadcn

4. **Email Delivery**
   - Research: Resend vs native SMTP for Supabase Edge Functions
   - Research: Email template best practices
   - Research: Retry strategies for failed email delivery

### Unknowns from Technical Context (Deferred Clarifications)

The following items were marked as `[NEEDS CLARIFICATION]` in the spec but deferred as low-priority:

1. **Maximum inquiry content length** (FR-006)
   - **Decision**: Set reasonable defaults (title: 200 chars, content: 5000 chars)
   - **Rationale**: Can be adjusted later based on actual usage patterns

2. **Verification retry limits** (FR-011)
   - **Decision**: Implement soft limit (no hard lockout initially)
   - **Rationale**: Balance security with user experience; can add stricter limits later

3. **Admin session timeout** (FR-016)
   - **Decision**: Use Supabase Auth default (24 hours)
   - **Rationale**: Standard practice; can be configured via Supabase settings

4. **Dashboard time period** (FR-019)
   - **Decision**: Show "today" stats + all-time stats
   - **Rationale**: Provides immediate context and historical overview

5. **Date range filtering** (FR-023)
   - **Decision**: Implement basic date range filter (from/to dates)
   - **Rationale**: Standard feature for admin panels

6. **Email delivery failure handling** (FR-038)
   - **Decision**: Log failures, retry once, then manual admin notification
   - **Rationale**: Simple approach; can add queue system later if needed

7. **Response time SLA, Multi-language support**
   - **Decision**: No SLA enforcement in v1; English-only UI
   - **Rationale**: Simplify initial implementation; add later based on demand

**Output**: research.md (to be generated next)

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

**Status**: ✅ COMPLETE

### Data Model Design
✅ Generated `data-model.md` with:

**Entities**:
1. **inquiries** table (complete schema with constraints, indexes, RLS policies)
2. **Admin users** (Supabase Auth managed)

### API Contracts
✅ Generated OpenAPI specs in `/contracts/`:

**Public Endpoints** (`contracts/inquiries.yaml`):
- `POST /api/inquiries` - Submit inquiry
- `POST /api/inquiries/verify` - Verify and retrieve inquiry

**Admin Endpoints** (`contracts/admin.yaml` - require auth):
- `GET /api/admin/inquiries` - List inquiries (with filters)
- `GET /api/admin/inquiries/[id]` - Get inquiry detail
- `PATCH /api/admin/inquiries/[id]` - Send reply or update status

### Agent File Update
✅ Ran `.specify/scripts/bash/update-agent-context.sh claude`
- Added Supabase, shadcn/ui, Vercel to tech stack
- Documented Layered Architecture structure
- Added recent clarifications

**Output**: ✅ data-model.md, contracts/*.yaml, quickstart.md, CLAUDE.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
1. Load `.specify/templates/tasks-template.md` as base
2. Generate tasks from Phase 1 design docs:

**Infrastructure Tasks**:
- Initialize Next.js 15 project with src/ directory structure
- Set up Supabase project and local development
- Create database migration: inquiries table
- Create database migration: RLS policies
- Create Edge Function: send-auth-code
- Create Edge Function: send-reply-email

**Implementation Tasks**:
- Implement POST /api/inquiries (create inquiry + generate code)
- Implement POST /api/inquiries/verify (verify code + return data)
- Implement GET /api/admin/inquiries (list with filters)
- Implement GET /api/admin/inquiries/[id] (detail view)
- Implement PATCH /api/admin/inquiries/[id] (reply + status)

**UI Tasks**:
- Set up shadcn/ui with Orange theme
- Add dashboard-01 block (admin layout)
- Add login-05 block (admin login)
- Implement InquiryForm component (customer)
- Implement InquiryCheckForm component (customer)
- Implement InquiryTable component (admin)
- Implement InquiryDetailPanel component (admin)
- Implement ReplyFormPanel component (admin)
- Implement StatusBadge component (admin)
- Implement StatCards component (admin dashboard)

**Ordering Strategy**:
- Infrastructure → Database → API Implementation → UI
- Mark [P] for parallel execution (independent files)
- Dependencies: DB schema before API, API before UI

**Estimated Output**: 30-35 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

No violations detected. This section is not applicable.

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) ✅
- [x] Phase 1: Design complete (/plan command) ✅
- [x] Phase 2: Task planning complete (/plan command - describe approach only) ✅
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS ✅
- [x] Post-Design Constitution Check: PASS ✅
- [x] All NEEDS CLARIFICATION resolved (deferred items documented in research.md)
- [x] Complexity deviations documented (N/A - no deviations)

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*
