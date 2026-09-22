
# OpenBooks Architecture

## System shape

OpenBooks is a server-first Next.js App Router application.

~~~text
Browser
  │
  ├── Public marketing / guides / tools
  ├── Auth pages
  └── Authenticated workspace
          │
          ▼
Next.js App Router
  │
  ├── app/                routes, pages and API handlers
  ├── auth.ts             Auth.js bootstrap
  ├── proxy.ts            request/session boundary + rate limiting
  └── lib/                business services, validation, security, integrations
          │
          ├── Prisma
          │      │
          │      ▼
          │   PostgreSQL
          │
          ├── Resend
          │
          └── future provider boundaries
~~~

## Design principles

### 1. Server owns financial truth

The browser can collect financial input, but server-side code calculates or validates authoritative financial values.

Do not accept a client-provided invoice total as the source of truth. Invoice line values are recalculated server-side.

Money in persisted records uses Prisma Decimal(12,2).

### 2. A business is the tenant boundary

Business-owned records are scoped to a business.

The standard authorization entry point is:

lib/security/tenant.ts

A business-scoped API handler should establish:

~~~text
authenticated user
      ↓
business membership
      ↓
business-scoped query/mutation
~~~

Changing a businessId in a request must never grant access to another tenant.

### 3. Routes stay thin

Prefer:

~~~text
route handler
   ↓
validate request
   ↓
authorize tenant/role
   ↓
call service
   ↓
return safe response
~~~

Do not duplicate core finance/auth rules across route handlers.

### 4. Public and private surfaces are explicit

Public pages are intentionally crawlable and useful without an account.

Workspace data and APIs remain behind authentication/authorization.

Public invoice links are an intentional exception: a customer can view a specific invoice without creating an OpenBooks account.

### 5. Integrations stay behind boundaries

Email, payment providers and rate-limit infrastructure should be replaceable at the service boundary.

Paystack-specific code is retained as a future integration boundary but is deliberately unavailable in V1.

## Request protection flow

proxy.ts runs at the request boundary.

For relevant requests it:

1. identifies whether the request has an authenticated session;
2. avoids redirecting static assets;
3. applies rate limits to API/auth/public-invoice traffic;
4. allows explicitly public routes;
5. redirects unauthenticated private requests to login;
6. sends an authenticated request for / or /login to the dashboard.

When adding a new public page or public API route, update the public-route logic deliberately and document why it is public.

## Authentication architecture

Auth.js is bootstrapped from auth.ts with PrismaAdapter.

Providers currently configured:

- credentials;
- Google;
- GitHub.

Credentials users require a verified email before password login succeeds.

OAuth login requires a provider email identity.

Sessions use JWT strategy.

## Financial write architecture

For a manual invoice payment:

~~~text
API request
  ↓
tenant/customer/business payment-method checks
  ↓
serializable Prisma transaction
  ↓
validate outstanding amount
  ↓
create Payment
  ↓
create Receipt
  ↓
recalculate invoice status
  ↓
audit event
~~~

The payment service retries serialization conflicts a small number of times so concurrent payment requests cannot bypass the outstanding balance check.

## Reporting architecture

Dashboard/report periods use Nigeria local time (Africa/Lagos) rather than assuming the server timezone.

The reporting period helper is:

lib/reports/months.ts

The current financial contract is documented in:

docs/FINANCE.md

## Public invoice architecture

A public invoice uses Invoice.publicToken rather than exposing a sequential internal ID.

The public API intentionally returns customer-facing information only.

Bank details are only exposed when the business has enabled Bank Transfer for the relevant invoice/business context.

Public invoice routes are not intended to become an authenticated workspace.

## Background jobs

Vercel invokes:

GET /api/cron/overdue

The job:

- requires the configured cron bearer secret;
- finds invoices whose due date has passed;
- transitions eligible statuses to OVERDUE.

The cron schedule is defined in vercel.json.

## Security layers

Security is intentionally layered:

~~~text
HTTP headers
   ↓
request/session boundary
   ↓
rate limiting
   ↓
authentication
   ↓
tenant/role authorization
   ↓
input validation
   ↓
server-side financial invariants
   ↓
safe errors + audit events
   ↓
database constraints
~~~

See SECURITY.md for the complete security policy.

## Change protocol

Before changing architecture:

1. identify the owning layer;
2. read the relevant document and implementation;
3. preserve existing invariants unless the product decision explicitly changes them;
4. update tests;
5. update documentation;
6. run the release checks.

Avoid introducing a second source of truth for a rule that already has an existing service or contract.
