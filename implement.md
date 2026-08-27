# OpenBooks NG — Implementation Plan (Build + Test → Production Active)

**Version:** 1.0.0
**Status:** Build-approved
**Source of truth:** `buildversion.md` (authoritative), supplemented by `officialproduct.md` + `technicalimplementation.md`
**Repository (planned):** `github.com/awesomeakokayo/openbooks-ng`
**Primary DB:** Neon PostgreSQL (chosen)
**Auth:** Auth.js / NextAuth (all providers — credentials + OAuth) (chosen)
**Testing:** Vitest (unit/integration) + Playwright (e2e) (chosen)
**Paystack keys:** Owner-provided — use TEST keys in dev, verify platform/subaccount model before live money

---

## 0. How to Use This Document

### 0.1 Authority Chain
1. `buildversion.md` — if conflict, this wins
2. This `implement.md` — execution order
3. `officialproduct.md` + `technicalimplementation.md` — product context

### 0.2 Definition of Done (feature-level)
Per `buildversion.md:3398` — a feature is done only when all of these ship together:
`UI + Validation (client+server) + Server logic + DB behaviour + Authorization + Error handling + Tests + State transitions + Mobile experience` (+ financial integrity where money moves)

### 0.3 Mandatory Checkpoint (end of every phase)
Per `buildversion.md:3332` record:
```
CURRENT STAGE:
COMPLETED:
PARTIALLY COMPLETED:
NOT STARTED:
KNOWN BUGS:
ARCHITECTURAL DEVIATIONS (vs buildversion.md):
DATABASE CHANGES:
API CHANGES:
NEXT TASK:
```
If implementation drifts, run AI Recovery Rule `buildversion.md:3375`: Stop → Re-read `buildversion.md` → Identify stage → Inspect code → Compare → Correct deviations → Re-test → Update checkpoint → Continue.

### 0.4 Repo Hygiene (per user decision #3)
- Work/planning docs `buildversion.md`, `officialproduct.md`, `technicalimplementation.md` are **local-only, never pushed**.
- Add to `.gitignore`:
  ```
  buildversion.md
  officialproduct.md
  technicalimplementation.md
  ```
- Pushed in repo: `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`, `.env.example` (no secrets), `docs/`, source code.
- `README.md` is the distilled public summary of the work docs.

### 0.5 Paystack Keys Handling (per user decision #4 — you have keys)
Recommended approach:
- **Do NOT paste live secret into code or commit.**
- Configure locally in `.env.local` (gitignored) and in Vercel env dashboard + Neon not needed:
  ```
  PAYSTACK_SECRET_KEY=sk_test_xxx   # start with TEST
  PAYSTACK_PUBLIC_KEY=pk_test_xxx
  PAYSTACK_WEBHOOK_SECRET=whsec_xxx  # from Paystack dashboard
  APP_URL=http://localhost:3000
  ```
- Keep live keys (`sk_live_xxx`) only in Vercel Production env after Phase 6 verification step.
- Before any live settlement code, verify current Paystack platform/subaccount onboarding, KYC, fees, eligibility `buildversion.md:1132`, `officialproduct.md:405`. Suggested check sequence in Phase 6.5 below.
- Secret stays server-only `buildversion.md:1057`, `technicalimplementation.md:306` — never `NEXT_PUBLIC_`.

### 0.6 Money & Security Invariants (never violate)
- All business-owned data scoped by `businessId` + membership check `buildversion.md:318` — fuzz this every phase.
- Invoice total recalculated server-side, never trust client total `buildversion.md:548`.
- Public invoice uses crypto-random `publicToken`, never sequential ID `buildversion.md:613`.
- Money as `Decimal` (Prisma Decimal) — no float `buildversion.md:1558`; Paystack kobo conversion `amount * 100` consistently.
- Multi-record financial writes wrapped in `prisma.$transaction` `buildversion.md:1584`.
- Webhook idempotent (unique `providerReference`) `buildversion.md:1089` + `buildversion.md:1154`.
- Redirect ≠ proof of payment — server verification required `technicalimplementation.md:289`.

---

## Phase 0 — Foundation (Project Bootstrap & Architecture Lock)

**Goal:** Runnable Next.js + Prisma + Neon + Auth shell. Exit: user can auth and access own business workspace `buildversion.md:2161`.

### 0A. Scaffolding
1. Init: `npx create-next-app@latest openbooks-ng --typescript --eslint --tailwind --app --src-dir false`
2. `npm i prisma @prisma/client` + `npx prisma init`
3. `npm i next-auth@beta` (Auth.js), `zod`, `bcryptjs` (if credentials), `date-fns`
4. `npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom` + `npx playwright init`
5. Configure `prisma/schema.prisma` datasource `postgresql` provider `prisma-client-js`, generator.
6. Set `DATABASE_URL` to Neon pooled URL (from Neon dashboard). Add `DIRECT_URL` if using Neon pooling.
7. Create `.env.example` documenting every var without values `buildversion.md:2007`:
   ```
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."
   AUTH_SECRET="generate with npx auth secret"
   AUTH_URL="http://localhost:3000"
   PAYSTACK_SECRET_KEY="sk_test_..."
   PAYSTACK_PUBLIC_KEY="pk_test_..."
   PAYSTACK_WEBHOOK_SECRET="..."
   APP_URL="http://localhost:3000"
   BLOB_READ_WRITE_TOKEN="..."
   ```
8. `npm i @auth/prisma-adapter` if using Prisma adapter.
9. Tailwind mobile-first design tokens + shadcn/ui init (`npx shadcn@latest init`), base `app/layout.tsx`, responsive shell `components/ui/*`, `app/(dashboard)/layout.tsx`.
10. Create `.gitignore` additions (see 0.4) + `.env*` already.
11. Git init, initial commit, create GitHub repo `awesomeakokayo/openbooks-ng` (do not push work md files).

### 0B. Prisma Schema (full V1 — create once, migrate incrementally)
Implement all entities `buildversion.md:1348`, `buildversion.md:1419`:

```prisma
// Enums
enum InvoiceStatus { DRAFT SENT VIEWED PARTIALLY_PAID PAID OVERDUE CANCELLED }
enum PaymentMethod { CASH BANK_TRANSFER POS PAYSTACK OTHER ONLINE }
enum PaymentProvider { MANUAL PAYSTACK }
enum PaymentStatus { PENDING SUCCESS FAILED CANCELLED REFUNDED }
enum VerificationType { MANUAL AUTOMATIC }
enum ExpenseCategory { TRANSPORT MATERIALS ELECTRICITY RENT DATA SUPPLIES OTHER }
enum MemberRole { OWNER ADMIN STAFF } // BusinessMember ready for V2
```

Models:
- `User` (id, name, email, emailVerified, image, phone?, createdAt, updatedAt) — Auth.js compatible
- `Account`, `Session`, `VerificationToken` (Auth.js Prisma adapter models)
- `Business` (id, ownerId FK User, name, phone, email?, address?, logoUrl?, description?, currency String @default("NGN"), paystackSubaccountCode? String, createdAt, updatedAt) — NGN only V1 `buildversion.md:354`
- `BusinessMember` (id, userId, businessId, role MemberRole @default(OWNER), createdAt) @@unique([userId,businessId]) — V1 owner only but schema ready `buildversion.md:174`
- `BusinessPaymentSetting` (id, businessId @unique, bankTransferEnabled Boolean, cashEnabled Boolean, posEnabled Boolean, paystackEnabled Boolean, bankName?, accountName?, accountNumber?, updatedAt)
- `Customer` (id, businessId FK, name, phone, email?, notes?, createdAt, updatedAt) @@index([businessId])
- `Product` (id, businessId, name, description?, unitPrice Decimal, createdAt)
- `Invoice` (id, businessId, customerId, invoiceNumber String, status InvoiceStatus @default(DRAFT), publicToken String @unique, subtotal Decimal, discount Decimal @default(0), total Decimal, issueDate DateTime, dueDate DateTime?, notes?, createdAt, updatedAt) @@unique([businessId, invoiceNumber]) // numbering scoped to business
- `InvoiceItem` (id, invoiceId, description, quantity Decimal, unitPrice Decimal, lineTotal Decimal)
- `InvoicePaymentMethod` (id, invoiceId, method PaymentMethod) // per-invoice override `buildversion.md:639`
- `Sale` (id, businessId, customerId?, description, quantity Decimal, unitPrice Decimal, discount Decimal @default(0), totalAmount Decimal, paymentMethod PaymentMethod?, paymentStatus String?, saleDate DateTime, notes?, createdAt)
- `SaleItem` (id, saleId, description, quantity, unitPrice, lineTotal) // if supporting multi-item sales
- `Payment` (id, businessId, invoiceId?, customerId, amount Decimal, currency String @default("NGN"), method PaymentMethod, provider PaymentProvider, status PaymentStatus, providerReference String? @unique, verificationType VerificationType, verifiedAt DateTime?, createdAt, metadata Json?) @@index([businessId, invoiceId])
- `Receipt` (id, businessId, paymentId @unique, invoiceId?, customerId, receiptNumber String, amount Decimal, paymentMethod PaymentMethod, issuedAt DateTime, createdAt) @@unique([businessId, receiptNumber])
- `Expense` (id, businessId, category ExpenseCategory, amount Decimal, description?, paymentMethod String?, expenseDate DateTime, createdAt) @@index([businessId])
- `AuditEvent` (id, businessId?, userId?, action String, entityType String, entityId String?, metadata Json?, createdAt) // BUSINESS_CREATED etc `buildversion.md:2059`

**Critical schema rules:**
- Every business-owned model has `businessId` indexed.
- `publicToken`: generate with `crypto.randomBytes(16).toString('hex')` or `nanoid(32)`, unique, not guessable.
- Invoice/Receipt numbers: business-scoped sequences — implement via `SELECT ... FOR UPDATE` or serial table or Prisma interactive transaction locking to avoid duplicates under concurrency `buildversion.md:1198`.
- `providerReference` unique for idempotency.

### 0C. lib/ Structure (enforce from day 1)
```
lib/
 ├─ auth/          # auth.ts, auth.config.ts, requireAuth(), requireBusinessMember()
 ├─ business/      # createBusiness(), getBusinessByUser()
 ├─ customers/
 ├─ sales/
 ├─ invoices/      # calculateInvoiceTotal(), generatePublicToken(), nextInvoiceNumber()
 ├─ payments/      # createPayment.ts, verify-payment.ts, calculate-payment-status.ts
 ├─ paystack/      # client.ts (server-only), verifyTransaction()
 ├─ receipts/      # issueReceipt()
 ├─ expenses/
 ├─ reports/
 ├─ validation/    # zod schemas
 ├─ security/      # tenant check, rate limit, webhook signature
 └─ audit/         # logAuditEvent()
```
Business logic lives in `lib/*` `buildversion.md:1509`, UI calls services — never duplicate rules in route handlers.

### 0D. Auth Implementation
- `auth.ts` using Auth.js with PrismaAdapter + Neon.
- Providers: Credentials (email/password + phone optional), Google, GitHub (all as requested #2). Use mature solution, no custom session `buildversion.md:274`.
- Middleware `middleware.ts` protects `/dashboard`, `/api/*` (except `/api/auth/*`, `/api/webhooks/*`, `/invoice/[token]` public).
- Helper `requireBusinessMember(userId, businessId)` throws 403 if not member — used in every business-scoped route `buildversion.md:1460`.

### 0E. Tests for Phase 0
- **Unit (Vitest):** Decimal arithmetic sanity, `generatePublicToken` entropy length, zod validation rejects negative amount/quantity, `calculateInvoiceTotal` with discount.
- **Integration:** Prisma migrate + seed, Neon connection smoke, Auth.js sign-up → session → protected route 401/200.
- **Security:** Attempt `GET /api/business/otherId/customers` with user A → 403.
- **Manual:** Mobile viewport (375px) shell renders, lighthouse check.

### 0F. Exit Gate
- [ ] `npm run dev` boots, Neon connected, Prisma Studio shows tables
- [ ] User can sign up → log in → redirected to create-business
- [ ] `.env.example` complete, work md files gitignored
- [ ] Checkpoint written

---

## Phase 1 — Authentication & Business

**Goal:** User can create and manage their business workspace. `officialproduct.md:672`, `buildversion.md:2165`.

### Tasks
1. **Pages:** `app/(auth)/login`, `app/(auth)/register`, `app/(business)/create-business`, `app/dashboard` shell, `app/business/settings` + `app/business/payment-settings`.
2. **Create business flow (`lib/business/createBusiness`):** Validates `name, phone, currency=NGN` required `buildversion.md:332`, optional logo/address/email/description, creates `Business` + `BusinessMember(OWNER)` + default `BusinessPaymentSetting` in one transaction.
3. **Payment Settings UI:** Toggles BANK_TRANSFER/CASH/POS/PAYSTACK `buildversion.md:364`, bank fields conditional `buildversion.md:392`, Paystack connect placeholder (stores `paystackSubaccountCode` later). Defaults propagate to invoice creation.
4. **Dashboard shell:** Greeting `Good morning, Ade` `buildversion.md:1728`, metric cards (sales this month, customers owe you, customers count), action buttons `Record Sale / Create Invoice`, recent activity feed skeleton.
5. **API:** `GET/POST /api/business`, `GET/PATCH /api/business/settings`, `GET/POST /api/business/payment-settings` — every handler calls `requireBusinessMember`.
6. **Audit:** `BUSINESS_CREATED`, `BUSINESS_SETTINGS_CHANGED`.

### Tests
- Unit: `createBusiness` rejects missing phone, sets NGN default, handles concurrent business creation (owner can have 1 business in V1 — enforce or allow multiples and document).
- Integration: Create business → member row exists → other user cannot GET that business; PATCH payment settings persisted.
- E2E (Playwright): Register → Create business `Ade Phone Repairs` → sees dashboard → edits bank details → re-login sees persisted.

---

## Phase 2 — Customers & Sales (Cashbook Core)

**Goal:** Real business can use OpenBooks as digital notebook. `buildversion.md:2174`, `officialproduct.md:679`.

### Tasks
1. **Customer model + UI:** `app/customers` list (paginated, search by name/phone), `app/customers/[id]` profile, `components/customers/CustomerForm` (name, phone required, email/notes optional `buildversion.md:672`).
2. **Customer derived data:** `lib/customers/calculateCustomerOutstanding(businessId, customerId)` = `sum(invoice totals) - sum(SUCCESS payments)` `buildversion.md:708`. Also total purchases, total paid, transaction count, last transaction. Cached value optional later, records authoritative.
3. **Sales:** `app/sales` + `Record Sale` modal/page (customer select or create inline, item/service, quantity, unitPrice, discount, payment method, amount paid, date, notes) `buildversion.md:567`. Support quick single-item and multi-item via `SaleItem`.
4. **Dashboard totals:** `lib/reports/getDashboardMetrics(businessId)` — sales today/week/month, outstanding, customer count, expenses, recent transactions (server aggregation, not client).
5. **API:** `GET/POST /api/customers`, `GET/PATCH/DELETE /api/customers/[id]`, `GET /api/customers/[id]/history`, `GET/POST /api/sales`, `GET /api/dashboard/metrics`.
6. **Tenant isolation:** Every customer/sale query `where: { businessId }`.

### Tests
- Unit: Outstanding calc with no invoices (0), with partial payments, with overpayment attempt, multi-customer isolation.
- Integration: Create customer → record ₦20k cash sale → customer profile outstanding 0 if paid, or owed if not; dashboard metric increments; list pagination.
- E2E: Add customer `John 080...` → Record Sale `Website Design 1×₦150k Bank Transfer` → verify dashboard + customer history `officialproduct.md:678` → other business cannot see John.

---

## Phase 3 — Invoice Engine

**Goal:** Business can create and share professional invoice without customer account. `buildversion.md:2191`, `officialproduct.md:683`.

### Tasks
1. **Numbering:** `lib/invoices/nextInvoiceNumber(businessId)` — business-scoped sequence `INV-0001` (or `REC` pattern `buildversion.md:1189`) with `prisma.$transaction` + `SELECT FOR UPDATE` to prevent dupes under concurrency.
2. **Invoice creation:** `app/invoices/new` — select/create customer, add items (description, qty, unitPrice, lineTotal auto), discount, issueDate, dueDate, notes, payment methods (default from `BusinessPaymentSetting` + per-invoice override `buildversion.md:639`). Server recalculates `subtotal = sum(lineTotal)`, `total = subtotal - discount` `buildversion.md:546`.
3. **Status machine:** `lib/invoices/transitionInvoiceStatus()` enforces `DRAFT→SENT→VIEWED→PARTIALLY_PAID→PAID`, `OVERDUE` via dueDate check, `CANCELLED` terminal. No booleans `buildversion.md:597`.
4. **Public token:** `crypto.randomUUID()` or `nanoid(32)`, stored unique, route `app/invoice/[publicToken]/page.tsx` (unauthenticated, minimal data) `buildversion.md:618`: business name/logo, invoice number, items, amount, dueDate, enabled payment methods + bank details or Pay Online button.
5. **Invoice views:** `app/invoices` list (filters by status), `app/invoices/[id]` detail (owner view), `app/invoice/[token]` public view — ensure public view does NOT leak internal IDs/secrets `buildversion.md:1642`.
6. **WhatsApp share:** Generate `https://wa.me/?text=${encodeURIComponent(message)}` with `Hello John, your invoice from Ade Phone Repairs is ₦85,000. View: ${APP_URL}/invoice/${token}` `buildversion.md:1209`. Also copy link.
7. **API:** `GET/POST /api/invoices`, `GET/PATCH /api/invoices/[id]`, `GET /api/invoice/[token]` (public), `POST /api/invoices/[id]/send` (sets SENT).
8. **Audit:** `INVOICE_CREATED`, `INVOICE_SENT`, `INVOICE_VIEWED`, `INVOICE_CANCELLED`.

### Tests
- Unit: Invoice total calc, status transitions valid/invalid, next number concurrency (simulate 10 parallel creates → unique numbers), publicToken length/entropy.
- Integration: Create invoice → verify public page accessible without auth, internal API without business member → 403, `/invoice/123` does not exist (only token).
- E2E: Create invoice `iPhone screen ₦85k` Bank+Paystack → appears in list → open public link → only selected methods visible → share via WhatsApp link correctly formed.

---

## Phase 4 — Manual Payments (Critical Checkpoint: Must Work Without Paystack)

**Goal:** Entire system usable without Paystack `buildversion.md:2222`. Supports CASH, BANK_TRANSFER, POS as manually verified.

### Tasks
1. **Service:** `lib/payments/recordManualPayment({ businessId, invoiceId?, customerId, amount, method, date, notes, reference? })`
   - Validates amount >0, method in `CASH/BANK_TRANSFER/POS`, invoice belongs to business, amount ≤ outstanding (reject overpayment unless policy allows `buildversion.md:918` — V1 reject).
   - Creates `Payment { provider=MANUAL, verificationType=MANUAL, status=SUCCESS, verifiedAt=now }`.
   - Updates invoice status: `totalPaid = sum(SUCCESS payments)`; if `totalPaid==0→SENT/VIEWED`, `0<totalPaid<total→PARTIALLY_PAID`, `totalPaid>=total→PAID`, if past dueDate and not PAID → OVERDUE.
   - Creates `Receipt` via `issueReceipt()` atomically.
   - All in `prisma.$transaction`.
2. **Flows:**
   - Bank transfer `buildversion.md:929`: customer transfers → owner clicks Confirm Payment → enters amount/date/ref → manual payment.
   - Cash `buildversion.md:992`: Record Payment → Cash → amount → save.
   - POS `buildversion.md:1015`: same, optional terminal reference.
3. **UI:** `app/payments` list, `app/invoices/[id]` → `Record Payment` modal, `app/customers/[id]` → record payment, dashboard outstanding update.
4. **API:** `POST /api/payments`, `POST /api/payments/manual`, `GET /api/payments`, `GET /api/invoices/[id]/payments`.
5. **Outstanding:** Recalculate customer outstanding + dashboard after each payment.

### Tests (must pass before Paystack)
- Unit: Partial payments `buildversion.md:882`: invoice ₦150k → pay ₦50k → PARTIALLY_PAID outstanding ₦100k → pay ₦100k → PAID outstanding 0; overpayment rejection; zero/negative amount rejection; float vs Decimal (e.g., ₦33,333.33).
- Integration: Concurrent payments race (two ₦50k for remaining ₦50k → one succeeds, one rejected or queued); transaction rollback if receipt fails.
- E2E: Create invoice ₦85k → record cash ₦40k → status PARTIALLY_PAID → record bank transfer ₦45k → PAID → receipt exists → dashboard Customers owe you reduced.

---

## Phase 5 — Receipts

**Goal:** Every successful payment produces reliable receipt `buildversion.md:2245`.

### Tasks
1. **Model:** `issueReceipt(payment)` idempotent — if receipt exists for `paymentId` return existing (prevent double receipt on webhook retries).
2. **Numbering:** `REC-000001` business-scoped sequential `buildversion.md:1189` with transaction lock.
3. **Receipt page:** `app/receipts`, `app/receipts/[id]`, `app/invoice/[token]/receipt/[id]` (optional public), `app/receipt/[id]` printable view — shows receiptNumber, business, customer, invoice, items, amount, method, date, remaining balance.
4. **Actions:** Print (CSS @media print), Download PDF (HTML→PDF via `puppeteer` or `react-to-print` or `jspdf`), WhatsApp share `Receipt for ₦... : link`.
5. **API:** `GET /api/receipts`, `GET /api/receipts/[id]`, `POST /api/receipts` (internal via payment service).

### Tests
- Unit: Numbering uniqueness under concurrency, issueReceipt idempotency (call twice → one row).
- Integration: Manual payment → receipt auto-created → API returns it.
- E2E: After payment, click View Receipt → print preview loads → WhatsApp share link valid.

---

## Phase 6 — Paystack (Automated Online Payments)

**Goal:** Test payment flows Invoice → Paystack → Webhook → Verification → Payment → Receipt → Dashboard `buildversion.md:2268`.

### 6A. Provider Abstraction
- `lib/payments/paymentService.ts` interface: `initializePayment(), verifyPayment(), handleWebhook(), refundPayment()` — Paystack impl behind it `technicalimplementation.md:1118`.
- Keeps `lib/paystack/` isolated so future providers (Flutterwave etc) slot in `buildversion.md:1144`.

### 6B. Paystack Configuration (Neon storage)
- `Business.paystackSubaccountCode` String? — do NOT store secret `buildversion.md:462`.
- `BusinessPaymentSetting.paystackEnabled` gates `Pay Online` visibility.
- Server env holds `PAYSTACK_SECRET_KEY` (test vs live).

### 6C. Verification Prerequisite — DO FIRST (before coding live settlement)
Per `officialproduct.md:405`, `buildversion.md:1132`:
1. Read current Paystack docs: subaccount creation `POST /subaccount`, transaction initialize `POST /transaction/initialize` with `subaccount` + `bearer` fields, settlement schedule, KYC requirements for platform.
2. Decide architecture: Platform collects → subaccount settlement vs direct split. Document decision in `docs/paystack-settlement.md`.
3. Create test business subaccount via Paystack test API, capture `subaccount_code` like `ACCT_xxx`.
4. Only then code `initialize` to pass `subaccount: business.paystackSubaccountCode`.

### 6D. Initialize Flow
- `POST /api/payments/paystack/initialize` (authed or public via token)
  - Validates invoice belongs to business, paystack enabled for that invoice, amount >0, currency NGN.
  - Calls Paystack `POST https://api.paystack.co/transaction/initialize` with: `amount: totalOutstanding * 100` (kobo), `email: customer.email || business.email`, `reference: unique (e.g., OB_${invoiceId}_${Date.now()})`, `callback_url: ${APP_URL}/invoice/${token}?ref=xxx`, `subaccount: business.paystackSubaccountCode`, `metadata: { businessId, invoiceId, customerId, token }`.
  - Stores pending payment `status=PENDING, provider=PAYSTACK, providerReference=reference`.
  - Returns `authorization_url` to frontend.
- Frontend `app/invoice/[token]` → `Pay ₦85,000` button → fetch initialize → redirect to `authorization_url` (Paystack Checkout).

### 6E. Callback (Redirect — NOT trust)
- Customer returns to `app/invoice/[token]?reference=xxx&trxref=xxx`.
- Page shows "Verifying payment..." and optionally polls `POST /api/payments/paystack/verify { reference }` which server-verifies via `GET https://api.paystack.co/transaction/verify/:reference` using `PAYSTACK_SECRET_KEY`.
- **Never mark PAID on callback alone** `buildversion.md:1068`.

### 6F. Webhook (Source of Truth)
- `POST /api/webhooks/paystack` — **public, no auth**, but must validate:
  1. Validate signature per Paystack spec `buildversion.md:1141`: `x-paystack-signature` = `HMAC_SHA512(secret, rawBody)` compare.
  2. Extract `event: charge.success`, `data.reference`, `data.amount` (kobo), `data.currency`, `data.status`, `metadata` or `reference` mapping to invoice.
  3. Server-verify via `GET /transaction/verify/:reference` (trust only Paystack verify response, not webhook body alone).
  4. Confirm amount == expected outstanding (or invoice total), currency == NGN, status == success, business association via `metadata.businessId` or `reference` lookup.
  5. **Idempotency** `buildversion.md:1148`: `findFirst Payment where providerReference==reference` → if exists, return 200 without duplicate.
  6. Create `Payment { status=SUCCESS, provider=PAYSTACK, verificationType=AUTOMATIC, verifiedAt=now }`
  7. Update invoice status (PARTIALLY_PAID/PAID) + create receipt atomically.
  8. Return 200 quickly; handle errors with logging.
- Must handle Paystack retries (at least 3x) safely.
- Log webhook failures `buildversion.md:2041`.

### 6G. Settlement — NEVER wallet
Flow `buildversion.md:1115`: `Customer → Paystack → subaccount settlement → Business bank account`. OpenBooks only records. Do not hold funds `buildversion.md:225`.

### 6H. Tests for Phase 6 (mocked, no real money in CI)
- **Unit:** `verifyPaystackSignature` valid/invalid, `koboToNaira` conversion, amount mismatch logic.
- **Integration (Vitest + msw):** Mock `api.paystack.co/transaction/verify`:
  - Happy path: webhook charge.success → payment created → invoice PAID → receipt exists.
  - Idempotency: send same webhook twice → still one payment.
  - Bad path: webhook with tampered amount (e.g., ₦10k vs ₦85k) → rejected, no payment.
  - Bad path: wrong businessId → rejected.
  - Bad path: invalid signature → 401.
  - Pending→Success via verify endpoint.
- **E2E (Playwright, against Paystack test mode):** Use Paystack test card `408408...` to complete checkout in test invoice, wait for webhook (use local webhook tunnel via `ngrok` or mock webhook manually), assert invoice PAID.
  - Requires `PAYSTACK_SECRET_KEY=sk_test_xxx` from user #4, `PAYSTACK_PUBLIC_KEY=pk_test_xxx`.

### 6I. Exit Gate
- [ ] `docs/paystack-settlement.md` written and KYC requirements documented
- [ ] Test transaction end-to-end works: `Invoice → Paystack test checkout → webhook → verification → PAID → receipt` (using test keys)
- [ ] Live keys still NOT in repo, only in Vercel env

---

## Phase 7 — Expenses & Basic Reports

**Goal:** Owner can understand business performance `buildversion.md:2290`, `technicalimplementation.md:1498`.

### Tasks
1. **Expense:** `app/expenses` list + `Record Expense` form (category `TRANSPORT|MATERIALS|ELECTRICITY|RENT|DATA|SUPPLIES|OTHER` `buildversion.md:1241`, amount, description, paymentMethod, date). `lib/expenses/recordExpense()`.
2. **Reports:** `app/reports` or dashboard sections:
   - Sales: today/week/month (from Sales + Invoice payments success).
   - Payments: breakdown by `CASH|BANK_TRANSFER|POS|PAYSTACK`.
   - Outstanding: total + by customer + by invoice `buildversion.md:1319`.
   - Expenses: total + by category `buildversion.md:1328`.
   - Net: `Sales - Expenses` `buildversion.md:1335` — label as simple result, not accounting `buildversion.md:1342`.
   - All computed server-side via `lib/reports/*` with Prisma `aggregate`, `groupBy`.
3. **API:** `GET/POST /api/expenses`, `GET /api/reports?range=today|week|month`, `GET /api/reports/outstanding`.

### Tests
- Unit: Net calc, expense grouping, outstanding by customer (derived correctness), payment method breakdown.
- Integration: Seed sales/expenses/payments → report numbers match aggregates.
- E2E: Record expense ₦5k Transport → reports total updates.

---

## Phase 8 — Production Hardening (Security, Performance, Reliability)

**Goal:** Safe for controlled real-world usage `buildversion.md:2322`.

### Security Audit (`buildversion.md:2084` checklist — every item)
- [ ] Authentication tested (Auth.js session, protected routes, public invoice token not auth bypass)
- [ ] Authorization tested (tenant isolation — changing ID in URL/API never leaks other business data)
- [ ] Public token security tested (brute force resistance, 32-char random, rate-limited)
- [ ] Webhook validation tested (sig + server verify)
- [ ] Payment idempotency tested
- [ ] Financial calculations tested (Decimal, totals, partials)
- [ ] Input validation tested (zod on all financial inputs `buildversion.md:1539`: amount>0, qty>0, currency==NGN, valid date)
- [ ] Rate limiting (Upstash Redis or Vercel KV) on auth, initialize, webhook
- [ ] Secrets removed from client (grep `PAYSTACK_SECRET`, `DATABASE_URL` not in bundle)
- [ ] Error leakage reviewed (no stack traces to user `buildversion.md:1633`, structured logs with requestId/businessId)
- [ ] DB backups configured (Neon point-in-time + branching, plus pg_dump schedule)

### Additional Hardening
- **Audit trail:** `AuditEvent` for `BUSINESS_CREATED, CUSTOMER_CREATED, SALE_RECORDED, INVOICE_CREATED/SENT/CANCELLED, PAYMENT_RECORDED/CONFIRMED/FAILED, RECEIPT_CREATED, EXPENSE_RECORDED, BUSINESS_SETTINGS_CHANGED` `buildversion.md:2054` — not ledger, but ops history `buildversion.md:2073`.
- **Performance:** `buildversion.md:1657` — server aggregation, pagination (cursor), minimal client JS, loading skeletons, error boundaries, optimized queries with indexes.
- **PWA:** `manifest.json`, icons, installable, responsive, sensible caching; defer Service Worker/IndexedDB offline queue to V2 `buildversion.md:1692`.
- **Accessibility + Mobile testing:** Test on 360x640, 390x844 viewports, touch targets, keyboard nav.
- **Logging/Monitoring:** Vercel logs + Sentry/LogDraini? — track `failed payment init, webhook failures, DB errors, auth failures` `buildversion.md:2038`; never log secrets `buildversion.md:2047`.
- **Overdue handling:** Cron via Vercel Cron `vercel.json` — daily job to mark `dueDate < now && status in (SENT,VIEWED,PARTIALLY_PAID) → OVERDUE`.

### Tests for Phase 8
- **Security e2e:** Authenticated as Business A, try `GET /api/customers?businessId=B` or `GET /api/invoices/otherId` → 403; try public invoice token enumeration → 404 rate-limited.
- **Load:** Simulate 50 concurrent invoice creates → no duplicate numbers.
- **Webhook reliability:** Send 10 rapid identical webhooks → 1 payment.
- **Backup restore drill:** Restore Neon branch from backup.

---

## Phase 9 — Deployment & Production Active

**Goal:** Live at `openbooks.ng` (or Vercel URL) and handling real traffic.

### 9A. Deploy Pipeline
1. **Vercel project:** Connect GitHub repo, framework Next.js, build `npm run build`.
2. **Neon:** Production DB (separate from dev), pooled `DATABASE_URL` + `DIRECT_URL` in Vercel env, run `npx prisma migrate deploy` via build or manual.
3. **Env vars in Vercel dashboard:**
   - `DATABASE_URL`, `DIRECT_URL`
   - `AUTH_SECRET` (prod random), `AUTH_URL=https://openbooks.ng`
   - `PAYSTACK_SECRET_KEY=sk_test_xxx` first, then `sk_live_xxx` after verification
   - `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_WEBHOOK_SECRET`, `APP_URL=https://openbooks.ng`
4. **Migrations:** No `prisma db push` in prod — only `migrate deploy`.
5. **Webhook URL:** Register `https://openbooks.ng/api/webhooks/paystack` in Paystack dashboard (test then live), note secret.
6. **Domain:** Add custom domain in Vercel, HTTPS auto.
7. **Docs:** `README.md` (setup steps, `env.example`, Neon, Paystack, running locally, test accounts), `LICENSE` (AGPL-3.0 candidate `officialproduct.md:643` — decide before publish), `CONTRIBUTING.md`, `SECURITY.md` (disclosure email), `docs/paystack-settlement.md`.
8. **Monitoring:** Vercel Analytics, Sentry (optional), Neon monitoring, Paystack dashboard webhook logs.

### 9B. Production Smoke (Definition of Success `buildversion.md:2393`, `technicalimplementation.md:1549`)
Run Ade scenario end-to-end on production (test mode first, then live micro amount):
```
Sign up → Create Ade Phone Repairs → Add John 080... → Create invoice iPhone screen ₦85k Bank+Paystack → Share WhatsApp → John opens /invoice/token
  → Branch A (Bank Transfer): view GTBank 0123456789 → transfer → owner confirms → Payment manual SUCCESS → Receipt REC-000001 → Dashboard sales +₦85k, outstanding -₦85k, customer history updated
  → Branch B (Paystack): Pay Online → Paystack test checkout → webhook → verify → Payment automatic SUCCESS → PAID → receipt → dashboard
  → Branch C (Partial): pay ₦40k → PARTIALLY_PAID outstanding ₦45k → pay ₦45k → PAID
```
If this works reliably — **V1 done** `buildversion.md:2452`.

### 9C. Final Scope Checklist (`buildversion.md:2481`)
- [ ] Create business account
- [ ] Add customer
- [ ] Record sale
- [ ] Create invoice
- [ ] Choose accepted payment methods
- [ ] Share via WhatsApp
- [ ] Receive/record cash
- [ ] Receive/record bank transfer
- [ ] Receive/record POS
- [ ] Accept Paystack where configured
- [ ] Support partial payments
- [ ] Track outstanding
- [ ] Generate receipts
- [ ] Record expenses
- [ ] View basic totals

---

## Phase 10 — Real Business Pilot (Mandatory per `technicalimplementation.md:1522`)

- Recruit 5–10 real Nigerian businesses (not devs) `buildversion.md:2730`.
- Observe `technicalimplementation.md:1534`: create customers, record sales, create/share invoices, receive money, use WhatsApp, misunderstandings, repeated asks.
- Capture metrics `technicalimplementation.md:1739`: activation (signup→first sale), invoices created, invoice→paid conversion, retention 7/30/90d, transactions/month.
- **V2 roadmap** driven by pilot data, not guesses — candidate: offline mode, DVA auto-verify, reminders, inventory, teams `technicalimplementation.md:1688`.

---

## Testing Pyramid (Vitest + Playwright)

| Layer | Tool | Coverage |
|-------|------|----------|
| Unit | Vitest + jsdom | `calculateInvoiceTotal`, `calculateOutstanding`, `transitionStatus`, `nextNumber`, `kobo conversion`, zod validation, `generatePublicToken` |
| Integration | Vitest + Prisma test DB (Neon dev branch) + msw (Paystack mocks) | CRUD tenant isolation, `$transaction` atomicity, webhook idempotency, amount/currency mismatch, signature validation |
| E2E | Playwright | Full Ade flow, public invoice, authz bypass attempts, manual + Paystack (test card), receipt print, reports, mobile viewports |
| Security | Playwright + custom scripts | ID tampering fuzz, token brute force, rate limit, secret leakage grep, overpayment/negative amount |
| Performance | Lighthouse + k6 (optional) | Low-bandwidth simulation, pagination, bundle size |

**Seed script:** `prisma/seed.ts` — demo business + customers + invoices for dev.

---

## Repository Structure (Final)

```
openbooks-ng/
├─ app/
│  ├─ (auth)/login  register/
│  ├─ (dashboard)/dashboard  customers/ sales/ invoices/ payments/ receipts/ expenses/ reports/
│  ├─ invoice/[publicToken]/  receipt/[id]/
│  ├─ api/
│  │  ├─ auth/[...nextauth]/
│  │  ├─ business/  customers/ sales/ invoices/ payments/ receipts/ expenses/ reports/
│  │  └─ webhooks/paystack/
│  └─ layout.tsx  globals.css
├─ components/  (ui/, customers/, invoices/, payments/, receipts/)
├─ lib/  (auth/, business/, customers/, sales/, invoices/, payments/, paystack/, receipts/, expenses/, reports/, validation/, security/, audit/)
├─ prisma/  schema.prisma  seed.ts  migrations/
├─ public/  (icons, manifest.json)
├─ tests/  (unit/ integration/ e2e/)  playwright.config.ts  vitest.config.ts
├─ docs/  paystack-settlement.md
├─ .env.example
├─ .gitignore  (includes work docs per 0.4)
├─ README.md  CONTRIBUTING.md  SECURITY.md  LICENSE (AGPL-3.0 pending)
└─ package.json  next.config.mjs  middleware.ts  vercel.json
```

---

## Environment Variables Glossary

| Var | Scope | Notes |
|-----|-------|-------|
| `DATABASE_URL` | server | Neon pooled |
| `DIRECT_URL` | server | Neon direct (migrations) |
| `AUTH_SECRET` | server | `npx auth secret` |
| `AUTH_URL` | server | `https://openbooks.ng` in prod |
| `PAYSTACK_SECRET_KEY` | server-only | `sk_test_*` → `sk_live_*` |
| `PAYSTACK_PUBLIC_KEY` | server/client | `pk_test_*` safe for client initialize (still via server) |
| `PAYSTACK_WEBHOOK_SECRET` | server | for HMAC verify |
| `APP_URL` | server/client | canonical URL |

---

## Implementation Order Rule
Follow Phases 0→10 strictly `buildversion.md:2144`. Never start Paystack (Phase 6) until Phase 4 manual payments fully works without it `buildversion.md:2228`. Never call a feature done until checkpoint passes `buildversion.md:3398`.

---

## Git Workflow & Commit Rule (Owner-Handled Push)

**HARD RULE — DO NOT PUSH TO GITHUB.**

Per owner instruction 2026-08-27: the AI agent must **never** run `git push`, `gh repo`, or any command that pushes code to GitHub. All pushing is handled exclusively by the owner.

After **every phase** (Phase 0 through Phase 10), the agent must:

1. Stage and commit locally only (`git add` + `git commit`).
2. **Do NOT push.**
3. Send the owner an **extensive commit message** for that phase, containing:
   - Commit title (`feat(phase-X): ...`)
   - Summary of what was built
   - Files changed (added/modified)
   - Database/API changes
   - Tests added & results
   - Checkpoint status (per 0.3 template)
   - Next task
   - Verification steps / how to test locally
4. Wait for owner to review and push manually.

Violation of this rule is not allowed. Re-affirm at every phase: `NO PUSH — commit + message only`.

```
# Allowed
git status
git diff
git log
git add <files>
git commit -m "feat(phase-X): ..."

# FORBIDDEN (unless owner explicitly says "push now")
git push
git push origin <branch>
gh repo create / gh auth / any push helper
```

---

## Next Actions
1. Approve this `implement.md` (you just did).
2. Write `.gitignore` entry for work docs.
3. Scaffold Next.js + Prisma + Neon + Auth (Phase 0).
4. Record checkpoint after each phase in this file.
5. After each phase: commit locally + send extensive commit message — DO NOT PUSH.

