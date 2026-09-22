
# OpenBooks Authentication

## Entry points

Auth.js bootstrap:

auth.ts

Provider/session configuration:

lib/auth/config.ts

Request protection:

proxy.ts

Auth.js callback route:

/api/auth/*

## Supported sign-in methods

Current providers:

- Email/password credentials;
- Google OAuth;
- GitHub OAuth.

## Credentials flow

A credentials user must have:

- a valid account;
- a stored password hash;
- a verified email.

The authorization callback:

1. normalizes the email;
2. loads the user;
3. rejects users without a password or verified email;
4. compares the password with bcrypt;
5. returns the user identity on success.

Passwords are never returned to the browser.

## Email verification

Credential registration creates a verification token and sends a transactional email through the email service.

Verification endpoints are public because the user is not authenticated yet.

The security requirement is that tokens are:

- random;
- expiring;
- single-use;
- not logged.

## Password recovery

Password reset follows the same public-boundary principle.

The request endpoint should not reveal whether an arbitrary email belongs to an account.

Reset tokens must be:

- expiring;
- single-use;
- invalidated after successful use.

Existing sessions should be invalidated when the password is reset.

## OAuth

Google and GitHub are configured through Auth.js.

Production callback paths:

~~~text
https://www.openbooks.click/api/auth/callback/google
https://www.openbooks.click/api/auth/callback/github
~~~

The provider email is used as the identity signal required by the application.

OpenBooks intentionally does not automatically merge a credentials account and an OAuth account merely because the email addresses match.

When changing OAuth behavior, test:

- new account;
- existing account;
- missing provider email;
- provider callback error;
- logout/session behavior.

## Session model

Sessions use JWT strategy with a 30-day maximum age in the current configuration.

The authenticated user ID is copied into the token/session so server routes can authorize business access.

## Public/private routing

proxy.ts defines the public route boundary.

Public auth routes include:

- login;
- register;
- email verification;
- forgot password;
- reset password;
- auth error;
- Auth.js callbacks;
- public invoice pages/API.

Authenticated workspace routes require a session.

Adding a new public route is a security decision. Do not simply add a path to the public list because it makes a test pass.

## Business authorization after authentication

Authentication answers:

Who is this user?

Tenant authorization answers:

Can this user access this business?

The second check is handled through:

lib/security/tenant.ts

Every protected business data path must perform both checks.

## Role authorization

Business membership roles currently include:

~~~text
OWNER
ADMIN
STAFF
~~~

Sensitive operations should require the appropriate role helper rather than checking role strings ad hoc in route components.

## Auth change checklist

When changing authentication:

1. inspect auth.ts;
2. inspect lib/auth/config.ts;
3. inspect proxy.ts;
4. inspect the relevant API/page;
5. inspect tenant/role authorization;
6. update tests;
7. update provider configuration documentation;
8. run lint, tests and build.

Never put provider secrets or session secrets in source code or documentation.
