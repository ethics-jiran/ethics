<!--
Sync Impact Report:
- Version change: 1.1.0 → 1.2.0
- Modified principles:
  * Removed IV. Test-First Development (TDD)
  * Renumbered V. Type Safety & Validation → IV
- Modified sections:
  * Development Workflow (removed testing gates)
- Rationale: Removed test-first requirement to streamline development
- Templates requiring updates:
  ✅ constitution.md (this file)
  ⚠ .specify/templates/plan-template.md (pending)
  ⚠ .specify/templates/tasks-template.md (pending)
-->

# Cherish (Customer Inquiry Management System) Constitution

## Core Principles

### I. Thin Client Architecture

All business logic MUST reside on the server (Next.js API Routes, Supabase Edge Functions, or database layer). Client-side code (external websites, admin UI) MUST be limited to:
- UI rendering and state management
- Data fetching via API calls
- User input validation (duplicated from server-side validation for UX only)

**Rationale**: Thin clients ensure security, maintainability, and consistent behavior across all entry points. Business rules remain centralized and testable.

**Non-negotiable rules**:
- NO business logic in client components (React, external forms)
- NO direct database queries from client code
- Server-side validation is authoritative; client-side is advisory only

### II. Single Responsibility Principle (SRP)

Every module, function, component, and API endpoint MUST have one clear responsibility.

**Examples**:
- One API route handles one resource operation (e.g., `POST /api/inquiries` only creates inquiries)
- One React component renders one UI concern (e.g., `InquiryTable` only displays table, not fetch logic)
- One Lambda/Edge Function performs one discrete task (e.g., `send-auth-code` only sends emails)

**Rationale**: SRP improves testability, debugging, and code reuse. Changes to one responsibility do not cascade.

**Non-negotiable rules**:
- Functions with multiple unrelated concerns MUST be refactored
- Component naming MUST reflect its single purpose
- Avoid "god objects" or "manager" classes that do everything

### III. Layered Architecture

Code MUST be organized by technical concerns (layers), with clear separation between presentation, business logic, and data access.

**Project structure**:
```
src/
  app/                # Next.js pages (presentation layer)
  components/         # UI components (presentation)
    forms/
    tables/
    ui/              # shadcn components
  lib/
    api/             # API client functions (data access)
    hooks/           # Custom React hooks (presentation logic)
    services/        # Business logic layer
    validations/     # Zod schemas (shared)
    supabase/        # Database client (data access)
  types/             # TypeScript type definitions (shared)
supabase/            # Database migrations & Edge Functions (infrastructure)
```

**Rationale**: Layered architecture enforces separation of concerns, making each layer independently testable and replaceable. Business logic is decoupled from UI and data access.

**Non-negotiable rules**:
- Presentation components MUST NOT contain business logic
- Business logic MUST reside in `lib/services/` or API routes
- Data access MUST be abstracted through `lib/api/` or Supabase client
- Cross-layer dependencies MUST flow in one direction (app → lib → data)

### IV. Type Safety & Validation

All data crossing boundaries MUST be validated and type-safe:
- API requests/responses: Zod schemas
- Database queries: TypeScript types generated from schema
- Form inputs: React Hook Form + Zod
- Environment variables: Validated at runtime with type-safe access

**Rationale**: Type safety catches errors at compile time. Runtime validation prevents invalid data from entering the system.

**Non-negotiable rules**:
- NO `any` types in production code (use `unknown` and narrow)
- All external inputs MUST be validated with Zod or equivalent
- Database types MUST be auto-generated, not hand-written

## Technology Stack Constraints

**Approved stack** (from clarifications and architecture discussion):
- **Frontend**: Next.js 15 (App Router), TypeScript, shadcn/ui (Orange theme), Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase PostgreSQL (Single Source of Truth)
- **Authentication**: Supabase Auth (TOTP 2FA for admins)
- **Email**: Supabase Edge Functions + Resend
- **Deployment**: Vercel (Next.js), Supabase Cloud

**Rationale**: This stack was chosen based on:
- Supabase provides integrated DB + Auth + Edge Functions (Single Source of Truth)
- Next.js enables thin clients with server-side rendering
- Layered architecture works naturally with Next.js App Router
- Vercel provides seamless Next.js deployment

**Non-negotiable constraints**:
- NO additional frameworks without constitutional amendment
- NO client-side ORM or direct database access
- NO alternative auth providers (use Supabase Auth only)
- Supabase is the Single Source of Truth for all data

## Development Workflow

**Naming conventions**:
- Database tables/columns: `snake_case` (PostgreSQL standard)
- TypeScript variables/functions: `camelCase`
- React components: `PascalCase`
- Files/folders: `kebab-case` (e.g., `inquiry-form.tsx`)
- Constants: `UPPER_SNAKE_CASE`

**Code organization**:
- All source code in `src/` directory
- Presentation layer: `src/app/` (Next.js pages) and `src/components/`
- Business logic layer: `src/lib/services/`
- Data access layer: `src/lib/api/` and `src/lib/supabase/`
- Shared utilities: `src/lib/` (validations, hooks, utils)
- API routes follow REST conventions: `/api/inquiries`, `/api/admin/inquiries`
- Database infrastructure: `supabase/` (root level, outside src/)

**Documentation requirements**:
- API endpoints MUST be documented with request/response examples
- Supabase RLS policies MUST include comments explaining purpose
- Complex business logic MUST include inline comments explaining "why"

## Governance

This constitution supersedes all other development practices. Amendments require:
1. Documented rationale for change
2. Impact analysis on existing code
3. Migration plan if breaking changes
4. Approval from project owner

**Compliance verification**:
- All code reviews MUST verify adherence to principles
- Violations MUST be flagged and corrected before merge
- Complexity additions MUST be justified against simplicity principle

**Amendment procedure**:
- Propose change via `/constitution` command with rationale
- Version bump follows semantic versioning:
  * MAJOR: Principle removal or incompatible redefinition
  * MINOR: New principle or section added
  * PATCH: Clarifications or typo fixes

**Version**: 1.2.0 | **Ratified**: 2025-10-02 | **Last Amended**: 2025-10-02
