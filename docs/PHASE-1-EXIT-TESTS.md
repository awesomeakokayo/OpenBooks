# OpenBooks NG — Phase 1 Exit Tests

Phase 1 is considered implementation-complete only when the code review is clean. It is considered release-ready only after these runtime tests pass with real local configuration.

## A. Account registration
- Register with valid name/email/password.
- User record is created with `emailVerified = null`.
- Verification token is created and is single-use.
- Verification email is sent through the configured Resend provider.
- User is redirected to `/verify-email` and is not signed in automatically.
- Invalid registration payloads are rejected.
- Duplicate emails are rejected without creating a second user.
- Registration is rate limited.

## B. Email verification
- Valid token verifies the intended user.
- Expired token is rejected.
- Reusing a consumed token is rejected.
- Verification token is removed after successful verification.
- Resend creates a replacement token and invalidates the prior token.
- Resend endpoint does not reveal whether an arbitrary email belongs to an account.
- Verification endpoints remain accessible without authentication.

## C. Credentials sign-in
- Verified credentials user can sign in.
- Unverified credentials user cannot sign in.
- Incorrect password cannot sign in.
- Sessions are created correctly after authentication.
- Authenticated user ID is available to protected server routes.

## D. Google and GitHub OAuth
- New Google user can authenticate when provider credentials are configured.
- New GitHub user can authenticate when provider credentials are configured.
- OAuth users are not forced through duplicate OpenBooks email verification.
- OAuth callback sends users to the dashboard/onboarding path.
- Existing credentials accounts are not automatically linked solely by matching email.
- `OAuthAccountNotLinked` and other supported auth errors render the dedicated `/auth-error` page.
- Provider credentials are never exposed to browser code.

## E. Password recovery
- Forgot-password page is publicly accessible.
- Existing credentials account can request a reset email.
- Unknown addresses receive an account-enumeration-safe response.
- Reset token expires.
- Reset token is single-use.
- Successful password reset invalidates existing database sessions.
- New password can authenticate after reset.

## F. Business onboarding
- Authenticated user with no business can access `/create-business`.
- Unauthenticated user is redirected to `/login`.
- Business step validates required business name and phone.
- Payment step requires at least one enabled payment method.
- Bank Transfer requires bank name, account name and exactly 10 account-number digits.
- Cash and POS can be enabled without bank details.
- Business, owner membership and payment settings are committed atomically.
- New businesses default to NGN.
- Paystack cannot be enabled through V1 onboarding.
- User is routed to the dashboard after successful onboarding.

## G. Tenant/access control
- A user cannot read another business's records by changing a business ID in a request.
- Business membership is required for protected business APIs.
- Public invoice routes remain accessible without an account.
- Authentication/recovery/public invoice routes are not accidentally protected by `proxy.ts`.
- Deferred Paystack endpoints are not exposed as a V1 UI capability.

## H. Configuration
- `.env.local` contains valid database/auth values.
- `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are configured for email tests.
- Google credentials and callback URLs are configured before Google tests.
- GitHub credentials and callback URLs are configured before GitHub tests.
- Real secrets never exist in Git history.

## Phase 1 exit criterion
All code-level review items are complete, and all tests above pass locally. Only then should implementation move to Phase 2: Customers and Sales.
