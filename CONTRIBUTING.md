
# Contributing to OpenBooks NG

The contribution workflow is intentionally simple: understand the owning layer, make a focused change, protect the invariant with tests, update documentation, and verify the build.

## Before changing code

Read the smallest relevant set:

1. README.md
2. docs/CODEBASE-MAP.md
3. docs/PHASE-CHECKPOINT.md
4. the implementation that owns the behavior
5. the relevant test

For financial, authentication, authorization or public-invoice changes, also read:

- docs/FINANCE.md;
- docs/AUTHENTICATION.md;
- SECURITY.md.

## Local setup

Requirements:

- Node.js 20+;
- npm;
- PostgreSQL-compatible database.

Setup:

~~~bash
npm install
cp .env.example .env.local
npx prisma generate
npx prisma migrate dev
npm run dev
~~~

Never commit .env.local or real provider/database credentials.

## Development commands

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

## Coding rules

### Keep business logic centralized

Route handlers should validate, authorize, call the owning service, and return a safe response.

Do not duplicate financial/authentication rules in multiple routes or pages.

### Preserve tenant isolation

Business-scoped operations must authorize membership through:

lib/security/tenant.ts

Changing a business ID must never grant access to another tenant.

### Preserve financial invariants

- invoice totals are authoritative on the server;
- successful invoice-linked payments reduce invoice outstanding;
- direct sales are separate from invoice payments;
- money uses decimal/kobo-safe arithmetic.

See docs/FINANCE.md.

### Keep secrets out of Git

Never commit:

- production environment values;
- database credentials;
- API keys;
- OAuth client secrets;
- auth/session secrets;
- access tokens;
- private customer data.

Use placeholders in examples.

## Before opening a PR

Run:

~~~bash
npm run lint
npm run test
npm run build
~~~

Run E2E tests for changes to core user journeys.

Also check:

- tenant checks are preserved;
- server-side financial calculations remain authoritative;
- new environment dependencies are added to .env.example with placeholders only;
- public/private route boundaries are intentional;
- no debug bypasses remain;
- documentation is updated.

## Documentation requirement

A meaningful behavior change should update its corresponding document.

Examples:

| Change | Update |
| --- | --- |
| Database/schema | docs/DATABASE.md |
| Financial rule | docs/FINANCE.md |
| Authentication | docs/AUTHENTICATION.md and SECURITY.md |
| Deployment | docs/DEPLOYMENT.md |
| SEO/public page | docs/SEO.md |
| Recurring bug | docs/TROUBLESHOOTING.md |
| Architecture | docs/ARCHITECTURE.md and/or docs/DECISIONS.md |

## PR scope

Keep a change focused.

Avoid combining unrelated:

- database migrations;
- authentication changes;
- payment logic;
- visual redesigns;
- SEO content
- infrastructure changes

unless they are genuinely part of one dependency chain.

## Commit guidance

Use a commit message that says what changed and why.

Examples:

~~~text
fix: prevent overpayment on concurrent invoice payments
docs: document production deployment flow
feat: add customer outstanding report
~~~

Do not put secrets or private customer information in commit messages.

## Code review focus

Reviewers should look for:

- authorization before business data access;
- financial values calculated on the server;
- input validation at boundaries;
- safe public invoice output;
- useful tests;
- documentation consistency;
- no accidental client-side secret exposure.

The repository should remain understandable without access to private conversations or the author's development machine.
