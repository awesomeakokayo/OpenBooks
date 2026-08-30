# OpenBooks NG — Current Build Checkpoint

**Current phase:** Production audit and remediation
**Implementation status:** Remediation in progress. Critical authorization, invoice-state, public-data, customer-balance, payment-method, write-input validation, role permissions, date semantics, report-query, financial-sequence, and sales-history pagination fixes have begun. Full runtime/build verification is still pending operator run and CI/deployment checks.

## Latest remediation work completed
- Added `docs/FULL-AUDIT-AND-REMEDIATION-PLAN.md` as the release gate and ordered implementation roadmap.
- Customer mutations now require both business membership and customer ownership within that business; deletion is blocked once transaction history exists and is now restricted to OWNER/ADMIN.
- Added reusable OWNER/ADMIN/STAFF authorization helpers in `lib/security/roles.ts`.
- Business profile updates now require OWNER/ADMIN privileges.
- Payment-settings access/mutation now requires OWNER/ADMIN privileges.
- Invoice status mutations now validate the allowed invoice state machine and require OWNER/ADMIN privileges.
- Overdue cron now fails closed when `CRON_SECRET` is missing instead of exposing an unauthenticated database mutation endpoint.
- Public invoice API now exposes bank details only when Bank Transfer is actually enabled for the invoice and marks the response `no-store`.
- Customer outstanding calculation now subtracts only successful invoice-linked payments; standalone payments cannot reduce invoice debt.
- Payment API now uses strict Zod request validation for V1 manual payment methods.
- Sales API now uses strict Zod request validation.
- Expense API now uses strict Zod request validation.
- Invoice creation API now uses strict Zod validation and the V1 payment-method contract.
- Invoice creation service now verifies requested payment methods against the business's enabled Bank Transfer/Cash/POS settings and rejects deferred/non-V1 methods server-side. Bank Transfer invoices require complete bank details.
- Manual payment service now verifies that the selected V1 payment method is enabled for the business and that an invoice payment belongs to the supplied customer.
- Centralized Nigeria reporting periods in `lib/reports/periods.ts` with Nigeria-local day/month boundaries and Monday-based week boundaries.
- Dashboard sale-period calculations now use `Sale.saleDate` rather than record creation time.
- Dashboard month expense figure now represents expenses recorded in the current Nigeria-local month rather than all-time expenses.
- Reports sale-period calculations now use the same Nigeria-local period semantics.
- Reports now aggregate customer invoice/payment totals instead of issuing invoice/payment queries once per customer.
- Reports outstanding-invoice records now expose actual outstanding amounts and dynamically show overdue status where applicable.
- Reports page now displays the actual outstanding amount per invoice instead of the original invoice total.
- Business schema now has per-business `invoiceSequence` and `receiptSequence` counters.
- Invoice numbering now atomically increments the business sequence and skips invoice numbers already present in legacy data.
- Receipt numbering now atomically increments the business sequence and skips receipt numbers already present in legacy data.
- Added explicit financial invariant regression coverage for partial/final payments, failed/cancelled/refunded payments, and invoice payment caps.
- Sales history now uses page-based pagination instead of rendering an unbounded merged transaction list in one request; the total money received summary is calculated independently from the current page.
- Payment history page now uses stable page-based pagination with a fixed page size and total-page navigation instead of a legacy 50-record ceiling.
- Payment-list service now accepts bounded `page`/`limit` arguments and returns pagination metadata for future API consumers.
- Deferred Paystack is no longer exposed in the invoice creation payment-method UI or direct-sale payment-method UI; V1 user-facing payment methods remain Bank Transfer, Cash and POS.
- Manual invoice payments now run inside a serializable database transaction with retry handling for serialization conflicts, preventing concurrent payments from bypassing the invoice outstanding cap.
- Dashboard and report sales totals now exclude direct sales recorded as "Unpaid / later" while continuing to show them in activity/history.
- Added centralized Nigeria date-only parsing for browser form dates and applied it to invoice due dates, sale dates, and expense dates.
- Direct sales now reject discounts greater than the sale subtotal and verify that the selected payment method is enabled for the business.

## Remaining critical remediation
- Audit every remaining business-scoped mutation for direct object-reference access outside tenant scope.
- Decide and enforce exact role policy for every OWNER/ADMIN/STAFF action across the application.
- Standardize all API validation and error responses.
- Complete duplicate-submission and direct-sale versus invoice-payment safeguards with end-to-end tests and explicit UX guidance.
- Add pagination/cursors to all remaining growing list endpoints.
- Complete OAuth/account-linking and session security audit.
- Complete production rate-limit configuration and trusted-proxy/IP review.
- Complete cross-host Vercel/Pxxl build verification.
- Finish mobile/accessibility/error/loading-state UX audit.
- Add the final end-to-end financial invariant test matrix.

## V1 payment rule
User-facing V1 methods are Bank Transfer, Cash and POS. Paystack is deferred and must not be exposed or required.

## Current continuation checkpoint
- **Completed in this continuation:** Paystack removed from invoice/sale user-facing selectors; manual invoice payment concurrency hardened; received-sales semantics corrected; browser date-only inputs normalized for invoices/sales/expenses; direct-sale payment-method enforcement and discount bounds added.
- **Verification status:** Changes are committed to `main`, but the GitHub commit checks for the latest revision are still pending. Do not treat pending checks as a passed production build.
- **Next task:** API/data-quality hardening — audit remaining mutation routes, standardize error responses/request IDs, remove unsafe casts in financial/auth paths where practical, and verify tenant/role enforcement before moving to final UX and deployment hardening.

## Release gate
Do not publish OpenBooks as a public production financial-record product until all P0 remediation items in `docs/FULL-AUDIT-AND-REMEDIATION-PLAN.md` are closed and tested, and Vercel/Pxxl production builds succeed from the same `main` revision.

## Recovery rule
If later work diverges from the implementation plan, stop feature work, compare the code to `docs/V1-IMPLEMENTATION-PLAN.md` and `docs/FULL-AUDIT-AND-REMEDIATION-PLAN.md`, correct the deviation, verify it, then update this checkpoint before continuing.
