# OpenBooks Documentation

This directory is the engineering documentation for OpenBooks. It is written to answer two questions quickly:

1. How does OpenBooks work?
2. Where do I change something safely?

The repository is the source of truth for implementation. Documentation explains the implementation and the constraints around it. When code and documentation disagree, verify the code, correct the documentation, and record the architectural change when it matters.

## Start here

| Need | Read |
| --- | --- |
| Understand the codebase | CODEBASE-MAP.md |
| Understand system design | ARCHITECTURE.md |
| Understand the product | PRODUCT.md |
| Review the public pitch | PITCH-DECK.md |
| Set up a development machine | ../CONTRIBUTING.md |
| Configure environment safely | ENVIRONMENT.md |
| Understand the data model | DATABASE.md |
| Understand financial rules | FINANCE.md |
| Understand authentication | AUTHENTICATION.md |
| Deploy the application | DEPLOYMENT.md |
| Understand integrations | INTEGRATIONS.md |
| Run test/release checks | TESTING.md |
| Fix recurring problems | TROUBLESHOOTING.md |
| Understand SEO | SEO.md |
| Work safely with AI coding agents | AI-DEVELOPER-GUIDE.md |
| Review architecture decisions | DECISIONS.md |
| Review durable milestones | CHANGELOG.md |
| See current implementation status | PHASE-CHECKPOINT.md |
| See the original V1 plan | V1-IMPLEMENTATION-PLAN.md |

## Existing reference documents

- ../SECURITY.md — security model and vulnerability reporting.
- ../CONTRIBUTING.md — contribution workflow.
- RATE-LIMITING.md — request-limiting implementation.
- backup.md — database backup/recovery notes.
- paystack-settlement.md — future Paystack provider design.
- FULL-AUDIT-AND-REMEDIATION-PLAN.md — audit/remediation history.
- PHASE-1-EXIT-TESTS.md — V1 identity/onboarding test checklist.

## Documentation rules

### Never document secrets

Never put a real database URL or password, authentication secret, OAuth client secret, API key, webhook signing secret, access token, private deployment credential, private customer data, or private bank data in Markdown, source comments, screenshots, commit messages, tests, fixtures, or examples.

Use placeholders only. The public .env.example file contains environment-variable names and placeholder formats. Secret values belong in the local secret store or deployment platform.

### Keep change locations explicit

When introducing a feature, update the relevant documentation with:

- the user-facing entry point;
- the route/API entry point;
- the service/helper that owns the business logic;
- the database entities involved;
- the tests covering the behavior;
- deployment/provider configuration when applicable.

### Keep current state separate from future plans

A future design is not a current feature. Paystack is the current example: its future settlement model is documented, but V1 does not process Paystack payments.

## Product and pitch maintenance

The product source of truth is PRODUCT.md.

The public submission deck is documented in PITCH-DECK.md and served at:

https://www.openbooks.click/pitch-deck

When product behavior changes, review both documents before submitting the deck externally.

## Documentation maintenance

Update the smallest relevant document when behavior changes.

| Change | Documentation |
| --- | --- |
| Product workflow or current capability | PRODUCT.md |
| Pitch slide narrative or evidence | PITCH-DECK.md |
| Database field/relation | DATABASE.md |
| Financial rule | FINANCE.md |
| Auth flow | AUTHENTICATION.md and SECURITY.md |
| Public SEO page | SEO.md |
| Deployment behavior | DEPLOYMENT.md |
| Integration/provider | INTEGRATIONS.md |
| Recurring bug | TROUBLESHOOTING.md |
| Architecture decision | DECISIONS.md |
| Major milestone | CHANGELOG.md |

For historical detail, use Git history rather than turning docs into a copy of commit messages.
