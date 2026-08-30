# OpenBooks NG — Current Build Checkpoint

**Current phase:** Production audit and remediation → UX/reliability handoff
**Implementation status:** Core P0 authorization, validation, financial correctness, role enforcement, payment-method gating, date semantics, atomic financial sequencing, reporting aggregation, pagination, public-invoice data minimization, and deferred Paystack isolation have been implemented. API/data-quality hardening has been completed for the core V1 endpoints. Runtime/build/deployment verification still requires the hosted check results or an operator run.

## Confirmed remediation work
- Customer mutations and reads are tenant-scoped; destructive customer deletion is OWNER/ADMIN only and blocked after transaction history exists.
- OWNER/ADMIN/STAFF authorization helpers exist and sensitive business/payment-settings/invoice-status mutations require admin-level access.
- Invoice status changes use the explicit invoice state machine.
- Cron authentication fails closed when `CRON_SECRET` is unavailable.
- Public invoice API returns recipient-facing fields only, gates bank details on Bank Transfer, removes internal IDs, and disables caching.
- Invoice-linked customer outstanding balances count only successful invoice-linked payments.
- V1 user-facing payment methods are Bank Transfer, Cash and POS. Paystack remains deferred and its initialize/verify/webhook endpoints return 410 rather than accepting money.
- Manual invoice payments are serialized with retry handling so concurrent requests cannot bypass the outstanding cap.
- Dashboard/reports received-sales totals do not count direct sales recorded as unpaid/later.
- Nigeria date-only browser inputs are normalized for invoice due dates, sale dates and expense dates.
- Direct sale discounts cannot exceed subtotal; direct-sale payment methods must be enabled for the business.
- Invoice discounts cannot exceed subtotal.
- Invoice and receipt numbers use atomic business-scoped sequences and skip legacy numbers already present.
- Dashboard/report date windows use Nigeria-local periods.
- Core growing APIs now expose bounded page/limit pagination and metadata: customers, sales, expenses, invoices, payments, receipts.
- API validation and error responses were standardized across core V1 routes; request IDs are returned via `userError()` and sensitive logging is redacted.
- Business service unsafe casts were removed; the main financial payment service no longer uses unsafe status/JSON casts.
- V1 enforces one business workspace per user so the existing `findFirst()` business-selection behavior is no longer silently ambiguous.
- Added regression coverage for financial invariants, direct-sale rules, Nigeria date parsing, and the V1 business-workspace invariant.

## API/data-quality gate
**Status: COMPLETE for the core V1 surface.**

The remaining verification is execution-level rather than design-level: run the full test suite, production build, and hosted deployment checks and fix any compiler/test/runtime failures they reveal. No pending CI/deployment status is being treated as a pass.

## Next stage — UX and overall reliability pass
1. Audit every screen at mobile widths (360×640 and 390×844), especially navigation, overflow, sticky regions, forms, tables, and touch targets.
2. Add/verify loading, empty, error and retry states on every data list.
3. Add visible pagination controls to every list whose API is now paginated.
4. Prevent accidental double submission with robust pending states and button disabling across every mutation form.
5. Make payment/invoice states and outstanding balances immediately understandable and consistent across dashboard, customers, invoices, payments and receipts.
6. Verify public invoice rendering, printable receipt/PDF output, and data consistency after partial/final payments.
7. Audit accessibility: labels, keyboard flow, focus states, semantic buttons/links, contrast and touch target sizes.
8. Remove remaining unnecessary duplicated queries or list caps discovered during the UX pass.
9. Run final financial E2E scenarios: direct sale, unpaid sale, partial invoice payment, final payment, invalid/overpayment, failed/cancelled payment, tenant isolation, and duplicate submission.
10. Finish with production build/test/deployment verification and update this checkpoint with exact results.

## Release gate
Do not publish OpenBooks as a public production financial-record product until the UX/reliability pass is complete, the final end-to-end matrix passes, and Vercel/Pxxl production builds succeed from the same `main` revision.

## Recovery rule
If later work diverges from the implementation plan, stop feature work, compare the code to `docs/V1-IMPLEMENTATION-PLAN.md` and `docs/FULL-AUDIT-AND-REMEDIATION-PLAN.md`, correct the deviation, verify it, then update this checkpoint before continuing.
