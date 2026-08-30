# OpenBooks NG — Current Build Checkpoint

**Current phase:** Production audit and remediation
**Implementation status:** Remediation in progress. Critical authorization, invoice-state, public-data, customer-balance, payment-method, and write-input validation fixes have begun. Full runtime/build verification is still pending operator run and CI/deployment checks.

## Latest remediation work completed
- Added `docs/FULL-AUDIT-AND-REMEDIATION-PLAN.md` as the release gate and ordered implementation roadmap.
- Customer mutations now require both business membership and customer ownership within that business; deletion is blocked once transaction history exists.
- Invoice status mutations now validate the allowed invoice state machine instead of allowing arbitrary status jumps.
- Overdue cron now fails closed when `CRON_SECRET` is missing instead of exposing an unauthenticated database mutation endpoint.
- Public invoice API now exposes bank details only when Bank Transfer is actually enabled for the invoice and marks the response `no-store`.
- Customer outstanding calculation now subtracts only successful invoice-linked payments; standalone payments cannot reduce invoice debt.
- Payment API now uses strict Zod request validation for V1 manual payment methods.
- Sales API now uses strict Zod request validation.
- Expense API now uses strict Zod request validation.
- Invoice creation API now uses strict Zod validation and the V1 payment-method contract.
- Invoice creation service now verifies requested payment methods against the business's enabled Bank Transfer/Cash/POS settings and rejects deferred/non-V1 methods server-side. Bank Transfer invoices require complete bank details.

## Remaining critical remediation
- Audit every remaining business-scoped mutation for direct object-reference access outside tenant scope.
- Add role-aware authorization for OWNER/ADMIN/STAFF.
- Standardize all API validation and error responses.
- Fix financial date semantics and ensure reports/dashboard use the correct business event dates.
- Resolve direct-sale versus invoice-payment double-counting risks with a documented transaction model and tests.
- Replace invoice/receipt count+1 numbering with atomic business-scoped sequences.
- Add pagination/cursors to all growing list endpoints.
- Reduce report N+1 database queries.
- Complete OAuth/account-linking and session security audit.
- Complete production rate-limit configuration and trusted-proxy/IP review.
- Complete cross-host Vercel/Pxxl build verification.
- Finish mobile/accessibility/error/loading-state UX audit.

## V1 payment rule
User-facing V1 methods are Bank Transfer, Cash and POS. Paystack is deferred and must not be exposed or required.

## Release gate
Do not publish OpenBooks as a public production financial-record product until all P0 remediation items in `docs/FULL-AUDIT-AND-REMEDIATION-PLAN.md` are closed and tested, and Vercel/Pxxl production builds succeed from the same `main` revision.

## Recovery rule
If later work diverges from the implementation plan, stop feature work, compare the code to `docs/F1-IMPLEMENTATION-PLAN.md` and `docs/FULL-AUDIT-AND-REMEDIATION-PLAN.md`, correct the deviation, verify it, then update this checkpoint before continuing.
