# OpenBooks NG — V1 Implementation Plan

This document is the implementation source of truth for V1. Work is executed phase-by-phase. Do not skip ahead unless the current phase is complete and the deviation is documented.

## Product boundary

OpenBooks NG is a free, open-source, mobile-first digital cashbook for Nigerian small businesses.

V1 supports:
- account creation and authentication;
- email/password, Google, and GitHub authentication;
- email verification for credentials-based registration;
- business onboarding;
- business payment preferences;
- direct bank-transfer details;
- cash, bank-transfer, and POS payment recording;
- customers and customer history;
- sales;
- invoices and public invoice links;
- manual payment recording and partial payments;
- receipts;
- expenses;
- basic reports;
- WhatsApp sharing.

V1 does NOT process online payments through Paystack or another payment provider. Paystack is deferred to a later provider-integration phase. No wallet or stored-funds system is part of V1.

## Phase 0 — Foundation and audit

Deliverables:
- repository audit;
- product rules captured in code/docs;
- environment variable contract;
- design tokens and component rules;
- authentication architecture;
- payment abstraction that does not require an external provider;
- security/tenant-isolation rules;
- test strategy.

Exit condition: implementation can proceed without ambiguous product or architecture decisions.

## Phase 1 — Identity and onboarding

Deliverables:
- credentials registration;
- secure password hashing;
- email verification token generation;
- transactional verification email via Resend adapter;
- verification page and resend flow;
- verified-email gate for credentials sign-in;
- Google OAuth;
- GitHub OAuth;
- account-linking behaviour;
- login, logout, forgot/reset password;
- business creation;
- business profile;
- payment-method onboarding;
- bank details validation.

Exit condition: a user can create a verified account, sign in, create a business, configure accepted payment methods, and reach a protected dashboard.

## Phase 2 — Customers and sales

Deliverables:
- customer CRUD;
- customer history;
- quick record-sale flow;
- payment-method recording;
- customer outstanding calculation;
- dashboard sales totals.

Exit condition: a business can record real sales and see correct customer/business totals.

## Phase 3 — Invoice engine

Deliverables:
- invoices;
- invoice items;
- invoice numbering;
- public tokens;
- due dates;
- invoice statuses;
- invoice payment-method overrides;
- public invoice page;
- WhatsApp/copy-link sharing.

Exit condition: a business can create and share a complete invoice without any payment provider.

## Phase 4 — Manual payments and receipts

Deliverables:
- cash payments;
- direct bank-transfer confirmations;
- POS payment records;
- partial payments;
- payment status calculation;
- receipt creation;
- receipt numbering;
- printable/downloadable receipt;
- WhatsApp receipt sharing.

Exit condition: the full manual workflow is complete: invoice → payment recorded → receipt → customer balance → dashboard.

## Phase 5 — Expenses and reports

Deliverables:
- expenses;
- basic sales reports;
- payment-method summaries;
- outstanding report;
- expense report;
- basic net figure.

Exit condition: business owner can understand basic financial activity from the dashboard/reports.

## Phase 6 — Production hardening

Deliverables:
- authorization review;
- tenant-isolation tests;
- rate limiting;
- audit events;
- webhook-independent payment integrity tests;
- error handling;
- backups;
- monitoring;
- performance/accessibility review;
- mobile QA;
- security review.

Exit condition: suitable for controlled real-world pilot.

## Phase 7 — Paystack (future, not V1)

Only after V1 is stable and real usage has been validated.

Planned future work:
- Paystack platform architecture decision;
- merchant/subaccount onboarding;
- provider configuration;
- online checkout;
- server-side verification;
- webhooks;
- idempotency;
- settlement handling;
- provider-specific compliance/KYC requirements.

Paystack must remain isolated behind a payment-provider boundary and must never be required for core OpenBooks functionality.

## AI recovery protocol

Before making changes, inspect the current phase and compare the implementation with this document.

If the implementation has drifted:
1. stop new feature work;
2. identify the current phase;
3. inspect the affected code and database schema;
4. identify the deviation;
5. correct the deviation;
6. run tests/build/lint as appropriate;
7. document the new state;
8. continue from the correct checkpoint.

## Phase checkpoint format

At the end of each phase, update a checkpoint with:
- current phase;
- completed;
- partially completed;
- not started;
- known bugs;
- architectural deviations;
- schema changes;
- API changes;
- next task.
