# Security Policy

## Reporting a Vulnerability

Email: awesomeakokayo@gmail.com with subject `[OpenBooks Security]`.
Do not open a public issue for sensitive reports. We aim to respond within 72 hours.

## Security Model (V1)

### Multi-tenant isolation
Every business is a logical tenant. All business-owned data is scoped by `businessId`.
Every server handler that touches business data calls `requireBusinessMember(userId, businessId)` 
`lib/security/tenant.ts:7` which checks `BusinessMember` unique `[userId,businessId]` and throws 403 if not a member.
This prevents ID tampering (`/api/invoices/abc` cannot read Business B by changing ID).

Covered routes: `/api/customers`, `/api/customers/[id]`, `/api/sales`, `/api/invoices`, `/api/invoices/[id]`,
`/api/payments`, `/api/receipts`, `/api/expenses`, `/api/reports`, `/api/business/payment-settings`.

### Authentication
Auth.js / NextAuth with PrismaAdapter + Neon. Providers: Credentials (bcryptjs 10 rounds) + GitHub + Google.
JWT strategy, middleware `proxy.ts` protects `/dashboard`, `/api/*` except public:
`/`, `/login`, `/register`, `/api/auth/*`, `/api/webhooks/*`, `/invoice/*`, `/api/invoice`, `/api/payments/paystack/*`.
Secret never leaves server: `PAYSTACK_SECRET_KEY` server-only, `DATABASE_URL` server-only.

### Secrets
- `.env*` gitignored, `.env.example` documents names without values.
- Never log `PAYSTACK_SECRET_KEY`, `DATABASE_URL` — `lib/security/error.ts` redacts them.
- Never expose sequential IDs publicly — invoices use `publicToken` `crypto.randomBytes(16).hex()` 32-char.

### Financial integrity
- Amounts use Prisma `Decimal(12,2)` — no float.
- Invoice totals recalculated server-side `lib/invoices/utils.ts:calculateInvoiceTotal`.
- Balances derived: `outstanding = sum(invoices total not CANCELLED) - sum(payments SUCCESS)` via `lib/customers/service.ts:68` and `lib/reports/*`.
- Multi-record writes in `prisma.$transaction`: `Payment + Receipt + Invoice status`.
- Overpayment guard: `recordManualPayment` rejects `amount > outstanding` `lib/payments/service.ts`.
- Idempotency: `Payment.providerReference` unique, `Receipt.paymentId` unique, webhook checks `existing.status === SUCCESS` before duplicate `app/api/webhooks/paystack/route.ts:32`.

### Webhook hardening
`POST /api/webhooks/paystack`:
1. `x-paystack-signature` HMAC_SHA512(secret, rawBody) timingSafeEqual `lib/paystack/client.ts`
2. `event === charge.success` else ack
3. Server `GET /transaction/verify/:reference` — never trust webhook body alone
4. Verify `status === success`, `currency === NGN`, `amount === expectedKobo`, business association via `providerReference` lookup
5. Idempotent, returns 200 on duplicate, 401 on bad sig, 429 rate limited per IP.
6. Rate limited via `lib/security/rateLimit.ts` (100/min webhook, 20/min initialize, 10/min auth).

### Rate limiting
In-memory token bucket `lib/security/rateLimit.ts` — per IP or per business. For scale, replace with Upstash Redis / Vercel KV.
Applied to: `POST /api/register` (10/min), `POST /api/payments/paystack/initialize` (20/min), `POST /api/webhooks/paystack` (100/min).
Headers `X-RateLimit-Remaining` + `X-RateLimit-Reset` returned on 429.

### Headers
`next.config.ts` adds `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`.

### Validation
All financial inputs via `zod` `lib/validation/schemas.ts`: `amount > 0`, `quantity > 0`, `currency NGN`, `valid date`, `valid email`, `valid payment method`.

### Audit trail
`AuditEvent` via `lib/audit/logger.ts` for `BUSINESS_CREATED`, `BUSINESS_SETTINGS_CHANGED`, `CUSTOMER_CREATED`, `SALE_RECORDED`, `INVOICE_CREATED/VIEWED`, `PAYMENT_RECORDED`, `EXPENSE_RECORDED`. Not the ledger itself, but ops history.

### Cron
`GET /api/cron/overdue` marks `dueDate < now && status in SENT,VIEWED,PARTIALLY_PAID -> OVERDUE` daily 02:00 via `vercel.json`. Protected by `CRON_SECRET` Bearer if set.

### Backups
Neon point-in-time + branching. Configure daily `pg_dump` in production and test restore per `docs/backup.md`.

### Error handling
User errors: `We couldn't save this payment. Please try again.` with `requestId`. Server logs: structured `[scope:requestId] message context` via `lib/security/error.ts`, never leaking stack or secrets to client.

## Checklist before production
- [ ] Tenant isolation tested (change ID in URL fails 403)
- [ ] Public token brute force rate limited 32-char random
- [ ] Webhook sig + verify + idempotency tested
- [ ] Financial calcs tested (Decimal)
- [ ] Input validation tested
- [ ] Rate limiting on auth/webhook
- [ ] Secrets not in client bundle (grep PAYSTACK_SECRET, DATABASE_URL)
- [ ] Backups configured + restore drill
- [ ] Error leakage reviewed (no stack in response)
