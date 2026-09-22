
# Security Policy

## Reporting a vulnerability

Email: awesomeakokayo@gmail.com with subject [OpenBooks Security].

Do not open a public issue for sensitive reports.

## Security model

### Multi-tenant isolation

Every business is a logical tenant.

Protected business routes must establish:

~~~text
authenticated user
      ↓
BusinessMember membership
      ↓
business-scoped read/write
~~~

The reusable membership check is:

lib/security/tenant.ts

Changing a business ID in a request must not grant access to another tenant.

## Authentication

Auth.js with PrismaAdapter provides:

- credentials login;
- Google OAuth;
- GitHub OAuth.

Credentials login requires a verified email.

Request protection is handled by proxy.ts.

The public/private boundary is explicit and includes the auth/recovery surfaces and public invoice access required by the product.

## Secrets

- Environment files containing real values are gitignored.
- .env.example contains placeholders only.
- Production secrets live in the deployment platform.
- Secret values must never appear in source, logs, screenshots, issues, tests or documentation.
- Server-side integrations must not expose private credentials to client code.

Error logging in lib/security/error.ts is designed to redact sensitive values.

## Financial integrity

- Financial persistence uses Prisma Decimal(12,2).
- Invoice totals are recalculated server-side.
- Successful invoice-linked payments are the only payment records that reduce invoice outstanding.
- Direct Sales do not settle invoices.
- Manual payment recording uses serializable database transactions and rejects overpayment.
- Payment plus Receipt plus invoice-status updates are kept consistent through the payment service.

See docs/FINANCE.md.

## Public invoices

Public invoice access uses a random public token rather than a sequential internal invoice ID.

Public invoice responses are minimized to recipient-facing information.

Payment details such as bank-transfer information must follow the business's enabled payment settings.

Public invoice pages are intentionally outside the authenticated workspace.

## Rate limiting

Rate limiting is implemented in:

lib/security/rateLimit.ts

Current route classes include:

| Class | Current limit |
| --- | --- |
| General API | 120 requests/minute |
| Auth | 30 requests/minute |
| Registration | 5 requests/10 minutes |
| Email verification | 10 requests/15 minutes |
| Password reset | 5 requests/15 minutes |
| Public invoice | 60 requests/minute |
| Future Paystack initialize | 20 requests/minute |
| Future Paystack webhook | 100 requests/minute |

The last two limits are retained as reserved configuration/documentation for a future provider phase; the current Paystack endpoints return 410 in V1.

The limiter can use an optional distributed Redis-compatible backend and falls back to an in-memory guard when the distributed limiter is unavailable.

## HTTP security headers

next.config.ts provides:

- X-Content-Type-Options: nosniff;
- X-Frame-Options: DENY;
- strict-origin-when-cross-origin Referrer-Policy;
- a restrictive Permissions-Policy for camera, microphone and geolocation.

## Validation

External input is validated through the Zod schemas under:

lib/validation/

Do not trust browser-calculated financial values.

## Audit trail

Important business actions are recorded through:

lib/audit/logger.ts

Audit events are operational history. They are not a replacement for financial records.

## Scheduled jobs

The overdue-invoice job is protected by a configured bearer secret and fails closed when it is missing.

Route:

/api/cron/overdue

## Paystack status

Paystack is intentionally deferred from V1.

The current Paystack initialize, verify and webhook routes return 410 and do not process money.

Do not reactivate provider processing without a fresh security and financial-integrity review.

Future provider design is documented in docs/paystack-settlement.md.

## Backup/recovery

See docs/backup.md.

Production recovery must be tested, not merely assumed.

## Production checklist

Before a production release:

- [ ] tenant isolation verified;
- [ ] public invoice data minimized;
- [ ] authentication/recovery flows tested;
- [ ] financial invariants tested;
- [ ] rate limiting reviewed;
- [ ] secrets absent from repository and client bundle;
- [ ] backups/recovery verified;
- [ ] error responses do not leak sensitive details;
- [ ] production build passes;
- [ ] relevant E2E scenarios pass.
