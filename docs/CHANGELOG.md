# OpenBooks Engineering Changelog

This document records durable project milestones. It is not a replacement for Git history.

## 2026-09-24 — Hackaholics pitch and product documentation

Added a public, print-ready OpenBooks pitch deck at /pitch-deck for startup programme submissions.

Added product documentation that defines:

- current V1 product capabilities;
- user groups and the core product journey;
- active and deferred payment boundaries;
- approved external-facing product language;
- evidence standards for future traction claims.

Added pitch-deck documentation covering the public route, slide narrative, visual system, maintenance rules and submission checklist.

## 2026-09-22 — Documentation system

The repository was upgraded from scattered engineering notes to a navigable documentation system covering:

- architecture;
- codebase map;
- database;
- financial rules;
- authentication;
- environment safety;
- deployment;
- integrations;
- SEO;
- testing;
- troubleshooting;
- AI-assisted development;
- architecture decisions;
- project milestones.

A pull-request documentation checklist and repository guidance for AI coding agents were also added.

## 2026-09-03 to 2026-09-08 — Reliability and mobile polish

The project continued with:

- public OG/social image improvements;
- dashboard/mobile layout fixes;
- removal of deferred Paystack UI;
- navigation persistence and scroll behavior;
- stronger touch targets;
- accessible primary actions.

## 2026-09-02 — Search acquisition system

OpenBooks expanded from basic metadata into a structured SEO/search acquisition system:

- central site identity and metadata;
- crawler policy and XML sitemap;
- indexability controls for public invoice tokens;
- software structured data;
- no-account browser tools;
- practical bookkeeping answer pages;
- industry-specific business guides;
- commercial product-intent pages;
- a central indexable public-path registry.

The SEO system is documented in docs/SEO.md.

## 2026-08-30 — Security, financial correctness and API quality

A broad production remediation pass addressed:

- tenant authorization;
- role-based settings/customer/invoice controls;
- strict financial input validation;
- Nigeria-local date semantics;
- invoice/payment financial invariants;
- concurrency-safe manual payments;
- atomic invoice and receipt numbering;
- report/dashboard consistency;
- API pagination;
- standardized errors and request IDs;
- secret redaction;
- rate limiting;
- deferred Paystack API paths;
- public invoice data minimization;
- V1 single-business behavior.

The phase/checkpoint documents under docs/ preserve the detailed remediation state.

## 2026-08-29 — Product surface and financial UX

Work focused on:

- shared workspace shell and navigation;
- dashboard/customer/invoice UX;
- invoice PDF and bank-transfer presentation;
- safer money math and readable statuses;
- mobile navigation and interaction behavior;
- payment/receipt history;
- business profile settings.

## 2026-08-28 — Identity/onboarding hardening

The project added and hardened:

- email verification;
- verification resend/recovery;
- password reset;
- Google/GitHub OAuth;
- business/payment onboarding;
- Phase 1 exit tests and checkpoints;
- production auth/build compatibility fixes.

## 2026-08-27 — Foundation and first product build

OpenBooks was established as a Next.js + Prisma + PostgreSQL/Auth.js application.

The initial implementation progressed through:

- foundation and design system;
- authentication and business onboarding;
- customers and sales;
- invoice engine;
- manual payments and receipts;
- Paystack provider work;
- expenses and reports;
- production hardening.

The original phase commits are preserved in Git. The V1 implementation plan later became the more durable planning source.

## Current product boundary

OpenBooks V1 records manual Cash, Bank Transfer and POS payments.

Paystack is intentionally deferred from V1. Its future design remains documented separately so it can be reintroduced through a deliberate provider phase rather than by restoring an old code path.

## Changelog rule

Record:

- what changed;
- why it mattered;
- any important migration or compatibility consequence.

Do not copy raw commit logs into this file.

Do not put secret values, private customer data or deployment credentials in changelog entries.
