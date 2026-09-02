# OpenBooks NG

OpenBooks is an open-source, Nigeria-first digital cashbook for small businesses. It helps business owners keep day-to-day financial records in one workspace: customers, sales, invoices, payments, receipts, expenses, and reports.

Production: https://www.openbooks.click

## Overview

OpenBooks is built as a full-stack Next.js application with a PostgreSQL database and Auth.js authentication. The product is designed around a simple principle: financial records should be easy to enter, easy to verify, and difficult to corrupt accidentally.

The application currently supports:

- Email/password registration and login with email verification.
- Google and GitHub OAuth through Auth.js.
- Business workspaces with tenant isolation through `BusinessMember` membership checks.
- Customer records and customer history.
- Sales and invoice management.
- Manual payments, online Paystack payments, and receipt generation.
- Expense tracking and financial reports.
- Public invoice links for customers.
- Audit events, rate limiting, security headers, and scheduled overdue-invoice processing.

## Technology

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router + TypeScript |
| Authentication | Auth.js / NextAuth v5 |
| ORM | Prisma |
| Database | PostgreSQL (Neon-compatible) |
| Styling | Tailwind CSS v4 |
| Validation | Zod |
| Password hashing | bcryptjs |
| Payments | Paystack |
| Email | Resend |
| Testing | Vitest + Playwright |
| Deployment | Vercel |

## Architecture

OpenBooks follows a server-first App Router architecture.

```text
Browser
  │
  ├── Pages / client components
  │
  └── Auth.js sign-in
          │
          ▼
Next.js App Router
  │
  ├── `app/`               UI and route handlers
  ├── `auth.ts`            Auth.js bootstrap
  ├── `proxy.ts`           session checks, public routes, rate limiting
  └── `lib/`               business services, security, validation, integrations
          │
          ├── Prisma
          │      │
          │      ▼
          │   PostgreSQL
          │
          ├── Resend
          └── Paystack
```

Business logic is intentionally kept in `lib/` services instead of being duplicated across route handlers. Database access for business-owned records is scoped to the authenticated user's business membership.

## Authentication

Auth.js is configured in `auth.ts` and `lib/auth/config.ts`. The production callback endpoint is exposed through the standard App Router route:

```text
/api/auth/*
```

OAuth callback URLs for the production domain are:

```text
https://www.openbooks.click/api/auth/callback/google
https://www.openbooks.click/api/auth/callback/github
```

For local development, replace the production origin with `http://localhost:3000`.

### Google OAuth

In Google Auth Platform, configure the production origin as an authorized JavaScript origin:

```text
https://www.openbooks.click
```

Configure this exact authorized redirect URI:

```text
https://www.openbooks.click/api/auth/callback/google
```

Google redirect URIs are exact-match values; scheme, hostname, path, and trailing slash must match the configured URI.

### GitHub OAuth

OpenBooks uses the GitHub App user-authorization flow. In the GitHub App's **Identifying and authorizing users** section, configure this callback URL:

```text
https://www.openbooks.click/api/auth/callback/github
```

Wildcard callback matching should remain disabled unless there is a documented reason to support it.

The application explicitly requests the GitHub `read:user user:email` scopes because OpenBooks requires an email identity for OAuth accounts.

### Production environment requirements

The Vercel production environment must contain the provider credentials used by `lib/auth/config.ts`:

```text
AUTH_SECRET
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
AUTH_GITHUB_ID
AUTH_GITHUB_SECRET
```

The legacy names `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_ID`, and `GITHUB_SECRET` are still accepted for migration compatibility, but the `AUTH_*` names are preferred.

`AUTH_URL` is optional with the current `trustHost: true` configuration. When it is set, it must be the canonical production origin and must not point to localhost or an old deployment URL.

After changing OAuth provider settings or production environment variables, redeploy the application so the new configuration is active.

### Existing-account behavior

OpenBooks keeps automatic OAuth account linking disabled. If an email/password account already exists and a user tries to sign in with Google or GitHub using the same email, Auth.js may return `OAuthAccountNotLinked`. This is intentional: the user should continue with the original sign-in method rather than silently merging identities.

## Data model

The Prisma schema is centered on the following entities:

```text
User
 ├── Account
 ├── Session
 ├── BusinessMember ── Business
 │                      ├── Customer
 │                      ├── Product
 │                      ├── Invoice ── InvoiceItem
 │                      ├── Sale ── SaleItem
 │                      ├── Payment ── Receipt
 │                      ├── Expense
 │                      └── AuditEvent
 └── Business (owner relation)
```

Auth.js adapter tables are represented by `User`, `Account`, `Session`, and `VerificationToken`. Financial amounts use Prisma `Decimal(12,2)` rather than JavaScript floating-point arithmetic.

## Tenant isolation

A business is treated as a logical tenant. Server-side business queries use the authenticated user's `BusinessMember` relationship to authorize access before reading or mutating business-owned data.

The main authorization helper is:

```text
lib/security/tenant.ts
```

Any new API handler that accepts a `businessId` should preserve this model and call the tenant authorization helper before accessing records.

## Repository structure

```text
.
├── app/                    # App Router pages and API route handlers
├── components/             # Reusable UI and feature components
├── lib/                    # Business logic, integrations and security helpers
├── prisma/                 # Prisma schema and database tooling
├── tests/                  # Unit and security tests
├── docs/                   # Public engineering documentation
├── auth.ts                 # Auth.js entry point
├── proxy.ts                # Request/session protection and rate limiting
├── next.config.ts          # Next.js configuration and security headers
├── vercel.json             # Vercel build/cron configuration
├── .env.example            # Environment variable reference (no real secrets)
└── README.md               # Project documentation
```

## Local development

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL database (Neon works well for development)
- OAuth credentials if you want to test Google/GitHub locally

### Setup

```bash
npm install
cp .env.example .env.local
```

Fill the required local environment variables in `.env.local`, then generate the Prisma client and apply migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

### Local OAuth callback URLs

Google:

```text
http://localhost:3000/api/auth/callback/google
```

GitHub:

```text
http://localhost:3000/api/auth/callback/github
```

Add these local callback URLs to the corresponding provider dashboards when testing OAuth locally.

## Environment variables

The repository intentionally documents variable names but does not contain production secrets.

### Required application variables

```text
DATABASE_URL
DIRECT_URL
AUTH_SECRET
```

### Authentication

```text
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
AUTH_GITHUB_ID
AUTH_GITHUB_SECRET
AUTH_URL (optional)
```

### Email

```text
RESEND_API_KEY
RESEND_FROM_EMAIL
```

### Payments

```text
PAYSTACK_SECRET_KEY
```

Additional optional variables are documented in `.env.example` for rate limiting, analytics, storage, administration, and scheduled jobs.

Do not commit `.env.local`, `.env.production.local`, provider secrets, database credentials, or other deployment credentials.

## Database workflow

For schema changes:

```bash
npx prisma migrate dev --name describe_change
npx prisma generate
```

For production deployment, use the appropriate migration deployment workflow rather than `prisma migrate dev` against the production database.

Useful Prisma commands:

```bash
npx prisma studio
npx prisma validate
npx prisma format
```

## Testing

Unit and security tests:

```bash
npm run test
```

End-to-end tests:

```bash
npm run test:e2e
```

Production build check:

```bash
npm run build
```

Before merging changes, run at minimum:

```bash
npm run test
npm run build
```

## Payments

Paystack is integrated as the online payment provider for invoice payments. The server initializes transactions, verifies completed transactions against the provider, and processes webhook events with signature verification and idempotency protections.

Public invoice payment routes intentionally do not require an OpenBooks account because invoice recipients may be external customers.

For implementation details, see `docs/paystack-settlement.md`.

## Security

OpenBooks includes several production-oriented controls:

- Authenticated route protection through Auth.js and `proxy.ts`.
- Business-level tenant authorization.
- Zod validation for financial inputs.
- Server-side invoice total calculations.
- Decimal money representation.
- Paystack webhook signature verification and provider-side transaction verification.
- Idempotency constraints on provider references and receipts.
- Rate limiting on sensitive endpoints.
- Security headers from `next.config.ts`.
- Structured server-side error handling without returning stack traces to clients.

Read `SECURITY.md` before deploying or extending security-sensitive functionality.

## Scheduled jobs

Vercel runs the overdue-invoice job from `vercel.json`:

```text
GET /api/cron/overdue
```

The route marks eligible overdue invoices as `OVERDUE`. Production cron requests should be authenticated with the configured cron secret.

## Public documentation

- `SECURITY.md` — security model and vulnerability reporting.
- `CONTRIBUTING.md` — contribution and review expectations.
- `docs/backup.md` — database backup and recovery guidance.
- `docs/paystack-settlement.md` — Paystack integration and settlement model.
- `docs/RATE-LIMITING.md` — rate-limiting implementation notes.
- `docs/V1-IMPLEMENTATION-PLAN.md` — public V1 implementation reference.

Internal product planning and non-public operating information should remain outside the repository.

## Deployment

OpenBooks is configured for Vercel with a Next.js build command that generates Prisma Client before building the application.

```text
Build command: prisma generate && next build
Framework: Next.js
```

For a production deployment:

1. Configure production environment variables in the deployment platform.
2. Configure the canonical domain.
3. Configure the Google and GitHub OAuth callback URLs to match the canonical domain exactly.
4. Apply database migrations.
5. Configure the Paystack webhook endpoint.
6. Run authentication, invoice, payment, receipt, and reporting smoke tests.

## Development conventions

- Keep route handlers thin; put reusable business logic in `lib/`.
- Validate all external input at the boundary.
- Never trust client-provided financial totals.
- Scope business data through tenant authorization.
- Keep provider credentials server-side.
- Prefer small, focused commits with meaningful messages.
- Add or update tests when changing financial, authentication, authorization, or webhook behavior.

## License

No final open-source license has been selected for the repository yet. Until a license is added, reuse and redistribution rights should not be assumed.
