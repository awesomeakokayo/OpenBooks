# OpenBooks NG — Full Audit & Production Remediation Plan

This document is the release gate for OpenBooks V1. The goal is to move from a working MVP to a dependable public product.

## Release principle

Every business action must have one clear meaning and produce consistent results across the UI, APIs, database, dashboard, reports, customer records, invoices, payments, and receipts.

A feature is not considered complete because the screen works. It is complete only when authorization, validation, persistence, calculations, error handling, mobile UX, and related records all agree.

## Priority order

### P0 — Release blockers

1. Close cross-business authorization gaps on customer mutations and audit all business-scoped mutations.
2. Enforce invoice status transitions through the invoice state machine.
3. Make cron authentication fail closed in production.
4. Never expose bank details through the public invoice API unless bank transfer is enabled.
5. Enforce invoice payment methods against the business's enabled V1 methods; Paystack remains deferred.
6. Fix customer outstanding calculations so only invoice-linked successful payments reduce invoice debt.
7. Add strict request validation to write endpoints (payments, sales, expenses, invoice mutations, business settings).
8. Establish and enforce role-aware permissions for OWNER/ADMIN/STAFF.

### P1 — Financial integrity

9. Define a single financial-event model/contract so direct sales and invoice payments do not drift or double-count.
10. Standardize date semantics: Sale uses saleDate, Payment uses successful/recorded time, Expense uses expenseDate, Invoice uses issueDate.
11. Audit all dashboard/report formulas for double counting and inconsistent date windows.
12. Replace concurrency-sensitive count+1 invoice/receipt numbering with atomic business-scoped sequences.
13. Add tests for partial payments, final payments, standalone sales, duplicate submissions, cancellations, refunds/failures, and exact dashboard/report totals.

### P1 — API/data quality

14. Add pagination/cursors instead of arbitrary 50-record caps.
15. Standardize API error responses and request IDs.
16. Remove unnecessary `as never` casts from financial/auth paths.
17. Reduce N+1 report queries using database aggregation/grouping.
18. Define business-selection behavior for accounts with multiple businesses; do not silently use `findFirst()` forever.

### P1 — Authentication/security

19. Complete Google/GitHub OAuth callback and account-linking audit.
20. Verify session expiry/logout behavior on both Vercel and Pxxl.
21. Verify Resend verification/password-reset delivery and recovery paths.
22. Validate trusted proxy/IP handling for distributed rate limiting.
23. Add security headers and review CSRF/origin protections where applicable.
24. Ensure logs never contain passwords, tokens, full bank details, or unnecessary customer data.

### P1 — UX/reliability

25. Make payment status immediately understandable from dashboard/activity/customer/invoice views.
26. Ensure all list pages have useful loading, empty, error, and retry states.
27. Audit mobile layouts, overflow, navigation, sticky regions, text contrast, and touch targets.
28. Verify public invoice/PDF consistency after every payment state change.
29. Ensure mutations give clear success/failure feedback and prevent accidental double submission.

### P2 — Production/deployment

30. Make Vercel and Pxxl use the same GitHub `main` source and equivalent production environment variables.
31. Configure Upstash on both hosts for distributed rate limiting.
32. Configure verified Resend domain(s) and production sender address.
33. Configure Google/GitHub production redirect URIs for every live domain.
34. Confirm database backup/recovery procedure.
35. Add monitoring/error tracking and production health checks.
36. Run a production build/test gate before each release.

## Financial invariants

For any invoice:

- `amountPaid = SUM(successful invoice-linked payments)`
- `outstanding = MAX(invoice.total - amountPaid, 0)`
- `status = PAID` only when outstanding is zero.
- A standalone sale/payment must never reduce an unrelated invoice balance.
- A payment must appear consistently in payment history, customer history, dashboard activity, reports, and receipt history.
- Direct sales and invoice payments must not be counted twice for the same real-world transaction.

## V1 payment rules

Supported user-facing methods:

- Bank Transfer
- Cash
- POS

Paystack is deferred. Existing Paystack schema/adapter code may remain isolated for future work, but V1 must not expose or require it.

## Completion rule

OpenBooks V1 is release-ready only when all P0 items are closed, all P1 financial/authentication items are verified, production builds succeed on both supported hosts, and the end-to-end test matrix passes.

## Implementation sequence

The implementation is intentionally sequential:

P0 security/authorization → P0 financial correctness → API/data quality → authentication hardening → UX hardening → production/deployment → final end-to-end release audit.

Every completed group must update `docs/PHASE-CHECKPOINT.md` and this plan with the commit reference and verification status.

## Current remediation log

### Remediation group 1 — P0 authorization/validation (in progress)

- Customer mutation tenant scoping: implemented in the working tree/recent commits.
- Invoice payment-method V1 restriction: implemented in validation/service paths.
- Strict create schemas for payment/sale/expense/invoice: implemented.
- Customer outstanding semantics: corrected to use invoice-linked successful payments.
- Reusable OWNER/ADMIN/STAFF authorization helpers added; business profile/payment settings/invoice status mutations use admin-level authorization.
- Cron endpoint now fails closed when `CRON_SECRET` is missing.
- Public invoice API no longer exposes bank details unless Bank Transfer is enabled.

Remaining in this group:

- Reconcile the exact latest `main` revision after concurrent repository updates.
- Complete audit of every business-scoped mutation and role-sensitive action.
- Verify all affected production branches/deployments build from the same revision.

### Remediation group 2 — P1 financial integrity (started)

- Centralized financial invariants added at `lib/finance/contract.ts`.
- Regression tests added for the real-world `₦300,000 → ₦200,000 → ₦100,000` invoice/payment case.
- Regression tests added to ensure failed/cancelled payments do not count as money received.
- Regression tests added to ensure a standalone payment cannot settle an unrelated invoice.
- Dashboard and reports use the same recorded-sales definition and Nigeria-local reporting periods.
- Dashboard/report customer outstanding calculations use only invoice-linked payments.
- Atomic business-scoped invoice and receipt sequencing implemented.

Remaining in group 2:

- Complete the direct-sale versus invoice-payment anti-double-counting policy in the UI and service layer.
- Add integration/end-to-end tests against a real test database for invoice/payment/report consistency.
- Audit refunds/cancellations and any future payment reversal semantics before launch.
