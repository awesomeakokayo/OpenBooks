
# OpenBooks NG

OpenBooks is an open-source, Nigeria-first digital cashbook for small businesses. It helps business owners keep customers, sales, invoices, payments, receipts, expenses and reports in one workspace.

**Production:** https://www.openbooks.click

## What it is

OpenBooks is a full-stack Next.js application built around a simple idea: financial records should be easy to enter, easy to understand and difficult to corrupt accidentally.

Current V1 capabilities include:

- account registration and authentication;
- email verification and password recovery;
- Google and GitHub OAuth;
- business onboarding and payment preferences;
- customer records and customer history;
- direct sales;
- invoices and public invoice links;
- manual payments and partial payments;
- receipts;
- expense tracking;
- financial reports;
- WhatsApp sharing;
- public SEO guides and business tools.

## Important product boundary

OpenBooks V1 records money received through manual payment methods:

- Cash;
- Bank Transfer;
- POS.

Paystack is currently **deferred from V1**. Paystack routes remain isolated in the codebase as a future provider boundary and must not be treated as active payment processing.

## Technology

| Area | Technology |
| --- | --- |
| Framework | Next.js App Router + TypeScript |
| Authentication | Auth.js / NextAuth |
| ORM | Prisma |
| Database | PostgreSQL |
| Styling | Tailwind CSS |
| Validation | Zod |
| Password hashing | bcryptjs |
| Email | Resend |
| Testing | Vitest + Playwright |
| Deployment | Vercel |

## Start here

| I need to... | Read |
| --- | --- |
| Understand the project | [docs/README.md](./docs/README.md) |
| Find where code lives | [docs/CODEBASE-MAP.md](./docs/CODEBASE-MAP.md) |
| Understand the architecture | [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) |
| Set up locally | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| Configure environment safely | [docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md) |
| Understand the database | [docs/DATABASE.md](./docs/DATABASE.md) |
| Understand financial rules | [docs/FINANCE.md](./docs/FINANCE.md) |
| Understand authentication | [docs/AUTHENTICATION.md](./docs/AUTHENTICATION.md) |
| Deploy | [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) |
| Run tests | [docs/TESTING.md](./docs/TESTING.md) |
| Debug a problem | [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) |
| Work on search/SEO | [docs/SEO.md](./docs/SEO.md) |
| Work with an AI coding agent | [docs/AI-DEVELOPER-GUIDE.md](./docs/AI-DEVELOPER-GUIDE.md) |
| Review architecture decisions | [docs/DECISIONS.md](./docs/DECISIONS.md) |
| See durable milestones | [docs/CHANGELOG.md](./docs/CHANGELOG.md) |

## Quick start

### Requirements

- Node.js 20+
- npm
- PostgreSQL-compatible database
- provider credentials for OAuth/email flows when those flows are being tested

### Install

~~~bash
npm install
cp .env.example .env.local
npx prisma generate
npx prisma migrate dev
npm run dev
~~~

Open http://localhost:3000.

The public .env.example contains placeholders only. Never replace those placeholders with real production values and commit the file.

## Common commands

~~~bash
npm run dev
npm run lint
npm run test
npm run test:e2e
npm run build
~~~

Prisma helpers:

~~~bash
npx prisma generate
npx prisma validate
npx prisma format
npx prisma studio
~~~

## Repository structure

~~~text
app/          Routes, pages and API handlers
components/   Reusable UI and feature components
lib/          Business logic, integrations, validation and security
prisma/       Prisma schema and database tooling
tests/        Unit/security/E2E coverage
docs/         Engineering documentation
auth.ts       Auth.js bootstrap
proxy.ts      Request/session boundary
vercel.json   Vercel build and cron configuration
~~~

## Non-negotiable engineering rules

1. Never trust client-provided financial totals.
2. Always preserve business tenant isolation.
3. Only successful invoice-linked payments reduce invoice outstanding.
4. A direct Sale is not an invoice payment.
5. Keep provider credentials and production secrets server-side.
6. Add tests for financial, authentication and authorization changes.
7. Update the relevant documentation when behavior changes.

## Security

Read [SECURITY.md](./SECURITY.md) before changing authentication, authorization, payments, public invoice data or other security-sensitive code.

Never put real secrets in Git, issues, screenshots, commits or documentation.

## Documentation

The documentation hub is [docs/README.md](./docs/README.md).

The repository intentionally keeps the README as an orientation document and puts detailed operational knowledge in docs/ so engineers can find the right place quickly without turning one file into an unmaintainable manual.

## License

No final open-source license has been selected for this repository yet. Until a license is added, reuse and redistribution rights should not be assumed.
