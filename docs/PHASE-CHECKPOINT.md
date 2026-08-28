# OpenBooks NG — Current Build Checkpoint

**Current phase:** Phase 1 — Identity and onboarding

## Completed
- Authoritative V1 implementation plan added.
- Paystack marked as deferred from V1 in the implementation plan and environment contract.
- Resend email provider boundary added.
- Resend SDK dependency added.
- Email verification token generation and verification email template added.
- Credential registration now creates a verification token and sends the verification email.
- Credential registration now redirects the user to the verification screen instead of signing them in immediately.
- Verification result page added and wired to display the registration email when supplied.
- Verification endpoint added with token expiry, token deletion, transaction-safe user verification, rate limiting, and non-sensitive error logging.
- Verification email resend endpoint added with rate limiting and account-enumeration-safe responses.
- Verification resend form added to the verification page.
- Credentials sign-in now requires `emailVerified` before authentication succeeds.
- Existing Google and GitHub OAuth providers remain declared in Auth.js configuration.
- Forgot-password request page and endpoint added.
- Password-reset email helper added using the existing Resend adapter.
- Password-reset confirmation endpoint added with expiring single-use reset tokens and session invalidation after password change.
- Password-reset page and form added.
- Login form now links to password recovery and shows reset-success feedback.
- Business creation service now accepts V1 payment setup and persists business + membership + payment settings atomically.
- Business onboarding is now a two-step flow: business identity, then payment methods.
- V1 payment onboarding supports Bank Transfer, Cash and POS only.
- Bank transfer onboarding requires bank name, account name and a 10-digit account number.
- Payment settings API now validates V1 payment methods and forcibly keeps Paystack disabled.
- Business onboarding page now explains that bank details are displayed to customers and funds are never held by OpenBooks.

## Partially completed
- Google/GitHub account-linking and callback behaviour still needs an explicit audit before production.
- Password recovery is implemented but still needs local end-to-end testing with a real configured Resend account.
- Business onboarding has been implemented but still needs local end-to-end testing and a final UX/accessibility audit.
- Bank account details are structurally validated, but account ownership/name verification is intentionally not performed in V1.
- Manual payment V1 audit/refactor is not yet complete.
- Paystack cleanup/isolation remains deferred; existing Paystack routes/schema concepts must not be exposed by V1.
- Resend production DNS/domain configuration remains an operator/deployment task; code assumes `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are configured.

## Not started
- Customers and sales.
- Invoice engine.
- Manual payments and receipts.
- Expenses and reports.
- Production hardening.
- Paystack future integration.

## Known implementation note
Password-reset tokens currently reuse Auth.js's existing `VerificationToken` table with a dedicated `password-reset:` identifier namespace. This avoids adding a schema migration during the identity implementation. If the identity system grows, a dedicated password-reset token model may be introduced in a later schema cleanup.

The repository still contains Paystack routes and Paystack-related Prisma fields/enums from earlier work. They are not part of the V1 feature surface. Do not expose or depend on them while implementing V1. The V1 payment-settings API explicitly forces `paystackEnabled` to false.

## Next task
Audit Google/GitHub OAuth account-linking and callbacks, then finish the final business-onboarding/access-control audit. After the Phase 1 exit criteria are met, move to Phase 2 customers and sales.

## Recovery rule
If later work diverges from the V1 implementation plan, stop feature work, compare the affected code with `docs/V1-IMPLEMENTATION-PLAN.md`, correct the deviation, test the corrected behaviour, and update this checkpoint before continuing.
