# OpenBooks NG — Current Build Checkpoint

**Current phase:** Phase 0 / Phase 1 (Identity foundation)

## Completed
- Authoritative V1 implementation plan added.
- Paystack marked as deferred from V1 in the implementation plan and environment example.
- Resend email provider boundary added.
- Email verification token/email helper added.
- Email verification result page added.
- Resend SDK dependency added to `package.json`.
- Existing Prisma schema already contains `User.emailVerified` and `VerificationToken` and is suitable for the planned verification flow.
- Existing Google and GitHub OAuth providers are already declared in Auth.js configuration.

## Partially completed
- Credentials registration endpoint still needs to be wired to create/send verification tokens. The current endpoint still creates the user without sending the verification email.
- Credentials sign-in still needs to enforce `emailVerified` before allowing normal credentials authentication.
- Registration UI still auto-signs the user in after registration and needs to redirect to `/verify-email` instead.
- Resend resend-email endpoint/UI flow still needs to be completed.
- Google/GitHub account-linking and callback behaviour needs an explicit audit before production.

## Not started
- Full business onboarding implementation.
- Required bank-transfer details validation and settings UX.
- Manual payment V1 audit/refactor.
- Paystack removal/quarantine cleanup beyond the environment contract.

## Known implementation note
The repository already contains Paystack routes and Paystack-related Prisma fields/enums. Do not delete them blindly; they must be audited and isolated/removed from the active V1 surface in the dedicated cleanup step.

## Next task
Finish Phase 1 identity flow end-to-end: registration → verification email → verification page → verified credentials sign-in → Google/GitHub OAuth → business onboarding handoff.
