
# OpenBooks AI Developer Guide

OpenBooks is developed with AI-assisted coding, but the codebase must remain understandable and verifiable by a human engineer.

This document is intentionally tool-agnostic. It applies whether the assistant is ChatGPT, Claude, a local coding agent, or another development tool.

## Golden rule

An AI agent may propose or implement code.

It does not become the source of truth.

The source of truth remains:

- the current repository;
- the Prisma schema;
- the financial/security contracts;
- passing tests;
- production build/runtime verification;
- current documentation.

## Before making a change

Read:

1. the task or issue;
2. docs/CODEBASE-MAP.md;
3. docs/PHASE-CHECKPOINT.md;
4. the relevant implementation;
5. the relevant invariant/test.

For a financial or authorization change, also read:

- docs/FINANCE.md;
- SECURITY.md;
- the relevant service and tests.

## Search before editing

Do not guess where logic lives.

Find:

- the route that receives the request;
- the service that owns the rule;
- the schema relation;
- existing tests;
- existing shared component/helpers.

Prefer extending an existing source of truth to creating a parallel helper.

## Preserve invariants

Common invariants that must survive changes:

- business tenant isolation;
- correct role authorization;
- server-calculated financial totals;
- only successful invoice-linked payments reduce invoices;
- direct sales do not settle invoices;
- money uses decimal/kobo-safe arithmetic;
- public invoices do not expose unnecessary private data;
- secrets remain server-side;
- private workspace/API paths are not accidentally made public.

## Small, reviewable changes

Prefer:

~~~text
one problem
  ↓
one coherent change
  ↓
tests
  ↓
docs
  ↓
build
~~~

Avoid mixing unrelated UI refactors, schema changes, SEO work and payment logic in one change unless there is a clear dependency.

## When something breaks

Do not immediately rewrite the nearest file.

First classify the problem:

- compile/type error;
- stale generated client;
- runtime/authentication error;
- authorization failure;
- database/schema mismatch;
- data/financial calculation bug;
- provider/deployment configuration;
- UI/layout issue;
- SEO/crawl issue.

Then trace the owning layer using CODEBASE-MAP.md.

## Safe AI prompts for this repository

Good instructions are specific about the invariant:

~~~text
Inspect the existing invoice payment service and tests.
Do not change the financial contract.
Fix the UI so the existing outstanding amount is displayed correctly.
Run tests and build.
Update the relevant documentation if behavior changes.
~~~

Weak instructions encourage accidental architecture drift:

~~~text
Rewrite payments so it works.
~~~

## Secrets and private data

Never provide an AI coding tool with:

- production secret values;
- database credentials;
- private customer records;
- auth cookies;
- private deployment tokens;
- full bank details.

Use sanitized fixtures and placeholder values.

## Verification after AI changes

At minimum for a meaningful code change:

~~~bash
npm run lint
npm run test
npm run build
~~~

For user-facing core flows, also run the relevant E2E tests.

Review the diff for:

- accidental public exposure;
- environment variables moved into client code;
- tenant checks removed;
- validation bypasses;
- unrelated generated-file churn;
- hard-coded provider secrets;
- documentation that now contradicts the implementation.

## Documentation is part of the change

When an AI agent changes:

- architecture → update ARCHITECTURE.md;
- financial behavior → update FINANCE.md;
- auth → update AUTHENTICATION.md and SECURITY.md;
- database → update DATABASE.md;
- deployment → update DEPLOYMENT.md;
- SEO → update SEO.md;
- recurring bug → update TROUBLESHOOTING.md.

Do not ask the next engineer to reconstruct why a change exists from an old chat transcript.

## Recovery protocol

When a change has caused codebase drift:

1. stop adding new feature code;
2. inspect current main;
3. compare with PHASE-CHECKPOINT.md;
4. identify the invariant that was lost;
5. restore the owning service/contract;
6. add regression coverage;
7. update documentation;
8. continue only after verification.

## AI-friendly repository hygiene

Keep:

- predictable directory ownership;
- small services;
- explicit names;
- comments for non-obvious constraints;
- tests near the rule they protect;
- documentation links in pull requests/commit messages.

Avoid:

- duplicate business logic;
- giant route handlers;
- unexplained casts;
- magic numbers;
- temporary bypasses left in production;
- comments that describe what obvious code already says but omit why it exists.
