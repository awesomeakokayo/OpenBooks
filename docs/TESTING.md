
# OpenBooks Testing

## Test goals

Tests protect two categories of behavior:

1. business correctness — financial calculations, state transitions, authorization and data consistency;
2. product reliability — the user-facing flows that connect those rules.

## Available commands

Install dependencies:

~~~bash
npm install
~~~

Unit/security tests:

~~~bash
npm run test
~~~

Watch mode:

~~~bash
npm run test:watch
~~~

End-to-end tests:

~~~bash
npm run test:e2e
~~~

Lint:

~~~bash
npm run lint
~~~

Production build:

~~~bash
npm run build
~~~

## Test layers

### Unit tests

Use unit tests for deterministic rules:

- money rounding;
- invoice totals;
- outstanding calculations;
- Nigeria date/month windows;
- state-machine helpers;
- role/authorization helpers.

These should be fast and independent.

### Security tests

Security-focused tests live under:

tests/security/

Priorities:

- tenant isolation;
- business-role enforcement;
- public/private route boundaries;
- token handling;
- sensitive data minimization;
- rate-limit behavior where deterministic tests are practical.

### End-to-end tests

E2E tests should protect user journeys rather than internal implementation details.

Core scenarios:

~~~text
registration
  ↓
verification
  ↓
login
  ↓
business onboarding
  ↓
customer
  ↓
sale
  ↓
invoice
  ↓
partial payment
  ↓
final payment
  ↓
receipt
  ↓
reports
~~~

Also cover:

- forgot password/reset;
- Google/GitHub login when provider config is available;
- public invoice access;
- unauthorized tenant access;
- mobile layout/touch behavior for critical actions.

## Financial regression matrix

Every release affecting financial logic should cover at least:

| Scenario | Expected outcome |
| --- | --- |
| Invoice created, no payment | outstanding equals invoice total |
| Partial payment | outstanding decreases by successful payment amount |
| Final payment | invoice becomes PAID |
| Failed/cancelled payment | does not count as money received |
| Overpayment attempt | rejected |
| Payment for another invoice | rejected |
| Direct sale | does not settle invoice |
| Duplicate payment submission | cannot create an invalid duplicate financial effect |
| Cancelled invoice | cannot receive a normal payment |
| Different tenant ID | request is denied |

## Time and timezone tests

Financial/reporting periods are based on Nigeria local time.

Use dates around month boundaries and around midnight to catch UTC/local-time regressions.

Do not assume the CI runner's timezone matches production.

## Database-backed testing

For tests involving Prisma persistence:

- use isolated test data;
- clean up deterministically;
- never point tests at production;
- avoid relying on existing personal records.

## Release gate

Before merging a meaningful change:

~~~bash
npm run lint
npm run test
npm run build
~~~

For changes to core user journeys, run:

~~~bash
npm run test:e2e
~~~

A test suite that passes while the production build fails is not a passing release.

## Adding a test

When adding a feature:

1. write the invariant/expected behavior first;
2. test the service rule;
3. test authorization where relevant;
4. test the user path when the feature is user-facing;
5. update documentation if the behavior changes a documented rule.

Do not test only the happy path for money, authentication or tenant isolation.
