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

## Partially completed
- Google/GitHub account-linking and callback behaviour still needs an explicit audit before production.
- Password recovery is implemented but still needs local end-to-end testing with a real configured Resend account.
- Business onboarding UI and server flow are not yet complete.
- Required bank-transfer details validation and payment-settings UX are not yet fully audited.
- Manual payment V1 audit/refactor is not yet complete.
- Paystack cleanup/isolation remains deferred; existing Paystack routes/schema concepts must not be exposed by V1.
- Resend production DNS/domain configuration remains an operator/deployment task; code assumes `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are configured.

## Not started
- Full business onboarding implementation.
- Bank account settings validation and persistence audit.
- Customers and sales.
- Invoice engine.
- Manual payments and receipts.
- Expenses and reports.
- Production hardening.
- Paystack future integration.

## Known implementation note
Password-reset tokens currently reuse Auth.js's existing `VerificationToken` table with a dedicated `password-reset:` identifier namespace. This avoids adding a schema migration during the identity implementation. If the identity system grows, a dedicated password-reset token model may be introduced in a later schema cleanup.

The repository still contains Paystack routes and Paystack-related Prisma fields/enums from earlier work. They are not part of the V1 feature surface. Do not expose or depend on them while implementing V1.

## Next task
Audit Google/GitHub OAuth account-linking and callbacks, then build business creation and payment-method onboarding including required bank-transfer details. After the Phase 1 exit criteria are met, move to Phase 2 customers and sales.

## Recovery rule
If later work diverges from the V1 implementation plan, stop feature work, compare the affected code with `docs/V1-IMPLEMENTATION-PLAN.md`, correct the deviation, test the corrected behaviour, and update this checkpoint before continuing.
