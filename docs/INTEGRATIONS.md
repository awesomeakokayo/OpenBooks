
# OpenBooks Integrations

## Integration principles

External services should never become the only source of business rules.

OpenBooks should:

- validate external responses server-side;
- keep provider credentials server-side;
- make duplicate requests safe where the integration can retry;
- isolate provider-specific logic;
- fail safely when an optional dependency is unavailable.

## PostgreSQL / Prisma

Persistence uses PostgreSQL through Prisma.

Primary files:

- prisma/schema.prisma;
- lib/db/;
- services under lib/.

See DATABASE.md.

## Auth.js

Auth.js is initialized in:

auth.ts

Provider/session configuration:

lib/auth/config.ts

Current providers:

- credentials;
- Google;
- GitHub.

Auth callback route:

/api/auth/*

See AUTHENTICATION.md.

## Resend

Resend is used for transactional email such as:

- email verification;
- password reset.

Email code lives under:

lib/email/

Provider credentials must remain server-only.

When changing email behavior, test both:

- delivery;
- security behavior (token expiry, single-use behavior, enumeration safety).

## Rate limiting

Rate limiting is implemented in:

lib/security/rateLimit.ts

The application can use:

- local in-memory limiting;
- distributed Redis-compatible limiting when configured.

The limiter has a local fallback so temporary limiter infrastructure failure does not automatically take the entire app offline.

See RATE-LIMITING.md.

## Vercel

Vercel is the current production deployment platform.

Relevant files:

- vercel.json;
- next.config.ts.

Vercel also invokes the overdue-invoice cron.

## Analytics

Analytics is optional and should remain separate from financial logic.

Admin analytics access is restricted by server-side configuration. Never put internal admin allowlists in client-side variables.

## Paystack: future boundary

Paystack is not active in OpenBooks V1.

The current API paths deliberately return 410 Gone for the Paystack initialize/verify/webhook endpoints.

This is intentional. Do not re-enable Paystack by simply restoring old provider calls without completing a fresh security and financial-integrity review.

Future design notes are retained in:

paystack-settlement.md

When Paystack is reintroduced, treat it as a provider phase with explicit verification, idempotency, webhook, settlement and compliance tests.

## Changing an integration

Before replacing or modifying a provider:

1. identify every import/use of the provider;
2. identify every environment dependency;
3. identify every webhook/callback;
4. identify provider-specific database fields;
5. update unit and integration tests;
6. update deployment configuration;
7. update this file;
8. run the complete release gate.
