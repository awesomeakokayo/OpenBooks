
# OpenBooks Codebase Map

Use this file as the navigation map before changing code.

## Top level

~~~text
app/                   Next.js App Router pages and API route handlers
components/            Reusable UI and feature components
lib/                   Business logic, integrations, validation and security
prisma/                Prisma schema and database tooling
tests/                 Unit and security tests
docs/                  Engineering documentation
auth.ts                Auth.js bootstrap
proxy.ts               Request authentication, public-route handling and rate limits
next.config.ts         Next.js server/runtime/security configuration
vercel.json             Vercel build and cron configuration
.env.example            Safe environment-variable reference
README.md              Project overview and first-run guide
SECURITY.md             Security policy and threat model
CONTRIBUTING.md         Contribution workflow
~~~

## Public website and SEO

Marketing and search-acquisition pages live directly under app/.

Key areas:

- app/page.tsx — public homepage.
- app/guide/ — legacy guide entry point.
- app/guides/ — search-answer content hub and guide pages.
- app/business-guides/ — industry-specific content hub/pages.
- app/tools/ — browser tools that can be used without an account.
- app/*-software*/ and related commercial routes — product-intent landing pages.
- app/for-businesses/, app/for-customers/, app/for-freelancers/ — audience pages.
- app/alternatives/ — comparison/alternatives acquisition page.
- app/invoice/[publicToken]/ — public customer-facing invoice page.

Central SEO configuration:

- lib/seo/site.ts — site identity and indexable public-path registry.
- lib/seo/metadata.ts — reusable page metadata.
- app/sitemap.ts — XML sitemap.
- app/robots.ts — crawler policy, including search-engine AI crawlers.
- components/seo/ — reusable SEO landing/tool presentation components.

## Authenticated workspace

The authenticated product is organized around these route areas:

- app/dashboard/ — business overview and reporting summary.
- app/customers/ — customer records and history.
- app/sales/ — direct sales.
- app/invoices/ — invoice management.
- app/payments/ — recorded payments.
- app/receipts/ — receipts.
- app/expenses/ — expenses.
- app/reports/ — reporting.
- app/business/ — business settings.
- app/create-business/ — onboarding.

Shared workspace UI is under components/workspace/.

## API map

Business APIs are under app/api/.

| Area | Route family | Main responsibility |
| --- | --- | --- |
| Identity | /api/auth/* | Auth.js callbacks |
| Registration | /api/register | Account creation |
| Verification | /api/verify-email/* | Email verification |
| Password recovery | /api/password-reset/* | Reset-token workflow |
| Business | /api/business/* | Business profile/payment settings |
| Customers | /api/customers/* | Customer CRUD/history |
| Sales | /api/sales | Direct sales |
| Invoices | /api/invoices/* | Invoice CRUD/state |
| Public invoice | /api/invoice | Public invoice data |
| Payments | /api/payments | Manual payment records |
| Receipts | /api/receipts | Receipt records |
| Expenses | /api/expenses | Expense records |
| Reports | /api/reports | Aggregated financial data |
| Cron | /api/cron/overdue | Marks eligible invoices overdue |
| Paystack future boundary | /api/payments/paystack/* | Intentionally unavailable in V1 |
| Paystack future webhook | /api/webhooks/paystack | Intentionally unavailable in V1 |

## Business logic

lib/ is the preferred place for reusable server-side rules.

- lib/auth/ — Auth.js provider/configuration behavior.
- lib/business/ — business creation/profile/payment settings.
- lib/customers/ — customer services and outstanding calculations.
- lib/db/ — Prisma client setup.
- lib/email/ — transactional email.
- lib/expenses/ — expense services.
- lib/finance/ — financial invariants/contracts.
- lib/invoices/ — invoice calculations, numbering and services.
- lib/payments/ — payment recording/listing.
- lib/paystack/ — future provider integration boundary.
- lib/receipts/ — receipt creation/numbering.
- lib/reports/ — dashboard/report calculations and date windows.
- lib/sales/ — direct sale services.
- lib/security/ — tenant authorization, rate limiting and safe error handling.
- lib/seo/ — shared SEO configuration/content helpers.
- lib/validation/ — Zod schemas and input validation.

## Tests

- tests/unit/ — deterministic business/utility tests.
- tests/security/ — authorization/isolation/security-focused tests.
- Playwright end-to-end tests live under the test suite configured by the repository Playwright configuration.

## Where should I change this?

| Task | Primary location | Also inspect |
| --- | --- | --- |
| Change a financial formula | lib/finance/, lib/invoices/, lib/reports/ | related API route + tests |
| Change who can access business data | lib/security/tenant.ts | API handler + SECURITY.md |
| Change authentication | auth.ts, lib/auth/config.ts | proxy.ts, auth pages, tests |
| Change an invoice workflow | lib/invoices/, app/invoices/ | public invoice route + payment service |
| Change payment recording | lib/payments/ | invoice status, receipt service, tests |
| Change receipt numbering | lib/receipts/ | Prisma schema + tests |
| Change dashboard totals | app/dashboard/, lib/reports/ | lib/finance/contract.ts |
| Add public SEO content | app/guides/ or relevant public route | lib/seo/site.ts, metadata, internal links |
| Add an interactive SEO tool | components/seo/ToolsInteractive.tsx | app/tools/, metadata |
| Change global branding | app/globals.css, brand component | page-level components |
| Change database structure | prisma/schema.prisma | affected service/tests/docs |
| Change production build/cron | vercel.json, deployment settings | DEPLOYMENT.md |
| Change request protection | proxy.ts, lib/security/ | route public/private rules |

## Rule of ownership

A route should usually orchestrate. A service should own reusable business behavior. A schema should describe stored data. A test should protect an invariant. Documentation should explain why the pieces are arranged that way.
