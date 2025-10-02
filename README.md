# Cherish - Customer Inquiry Management System

A modern customer inquiry management system built with Next.js 15, Supabase, and shadcn/ui.

## Features

- ✅ **Customer Inquiry Submission** - Submit inquiries via web form with email verification
- ✅ **Email Verification System** - 6-digit alphanumeric verification codes sent via email
- ✅ **Admin Panel** - Secure admin dashboard with TOTP 2FA authentication
- ✅ **Inquiry Management** - View, filter, search, and respond to customer inquiries
- ✅ **Status Tracking** - Track inquiry status (pending, processing, completed)
- ✅ **Email Notifications** - Automatic email notifications for verification and replies

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with TOTP 2FA
- **UI**: shadcn/ui with Orange theme + Tailwind CSS
- **Email**: Supabase Edge Functions + Resend
- **Validation**: Zod + React Hook Form
- **Deployment**: Vercel (recommended)

## Project Structure

```
cherish/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── inquiries/     # Public inquiry endpoints
│   │   │   └── admin/         # Admin-only endpoints
│   │   ├── inquiry/           # Customer pages
│   │   ├── admin/             # Admin pages
│   │   └── login/             # Login page
│   ├── components/            # React components
│   │   ├── forms/             # Form components
│   │   └── ui/                # shadcn/ui components
│   ├── lib/                   # Utilities
│   │   ├── supabase/          # Supabase clients
│   │   └── validations/       # Zod schemas
│   └── types/                 # TypeScript types
├── supabase/
│   ├── migrations/            # Database migrations
│   └── functions/             # Edge Functions
└── specs/                     # Feature specifications

```

## Quick Start

### Prerequisites

- Node.js 18+
- Docker (for local Supabase)
- Supabase CLI: `npm install -g supabase`

### Local Development

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd cherish
   npm install
   ```

2. **Start Supabase**:
   ```bash
   supabase start
   ```
   Save the API URL and anon key from the output.

3. **Configure environment variables**:
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   RESEND_API_KEY=<your-resend-api-key>
   ```

4. **Apply database migrations**:
   ```bash
   supabase db reset
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Usage

### Customer Flow

1. **Submit Inquiry**: Visit `/inquiry` to submit a new inquiry
2. **Receive Email**: Get a verification code via email
3. **Check Status**: Visit `/inquiry/check` to view inquiry status and replies

### Admin Flow

1. **Login**: Visit `/login` with admin credentials + TOTP code
2. **View Inquiries**: Browse and filter inquiries at `/admin/inquiries`
3. **Respond**: Click an inquiry to view details and send replies

## API Endpoints

### Public Endpoints

- `POST /api/inquiries` - Submit new inquiry
- `POST /api/inquiries/verify` - Verify and retrieve inquiry

### Admin Endpoints (require auth + MFA)

- `GET /api/admin/inquiries` - List inquiries with filters
- `GET /api/admin/inquiries/[id]` - Get inquiry details
- `PATCH /api/admin/inquiries/[id]` - Send reply or update status

See [API Documentation](./specs/001-customer-inquiry-management/contracts/) for detailed specs.

## Database Schema

### inquiries table

- `id` (UUID): Primary key
- `title`, `content`: Inquiry details
- `email`, `name`, `phone`: Customer info
- `auth_code`: 6-character verification code
- `status`: pending | processing | completed
- `reply_title`, `reply_content`: Admin response
- `replied_at`, `replied_by`: Response metadata

See [Data Model](./specs/001-customer-inquiry-management/data-model.md) for full schema.

## Deployment

### Supabase Cloud Setup

1. Create project at [supabase.com](https://supabase.com)
2. Push migrations:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
3. Deploy Edge Functions:
   ```bash
   supabase functions deploy send-auth-code
   supabase functions deploy send-reply-email
   ```

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
3. Deploy automatically on push to main

## Development Tasks

Completed implementation tasks (see [tasks.md](./specs/001-customer-inquiry-management/tasks.md)):

- ✅ T001-T007: Infrastructure setup
- ✅ T009-T018: Backend API & Edge Functions
- ✅ T021-T030: UI Components & Pages
- ⏸️ T008, T019-T020: Requires Supabase running
- ⏸️ T031-T034: Production deployment

## Contributing

See [quickstart.md](./specs/001-customer-inquiry-management/quickstart.md) for development workflow.

## License

ISC
