# OpenBooks Product Documentation

## Purpose

This is the product-level source of truth for what OpenBooks V1 is meant to do for a user.

Engineering documents explain how the system is built. This document explains the product surface, user journeys, current boundaries and the language used when presenting OpenBooks externally.

When implementation and this document disagree, verify the code first, then update this document.

## Product statement

OpenBooks is a Nigeria-first digital cashbook for small businesses and freelancers.

The current V1 product helps a business:

- create an account and business profile;
- keep customer records;
- record direct sales;
- create and share invoices;
- record manual payments;
- generate receipts;
- track expenses;
- review financial reports.

The product is intentionally narrower than full accounting software.

## Primary users

### Freelancers

Need a professional invoice and payment record without setting up a heavy accounting system.

### Small business owners

Need a simple place to see customers, sales, invoices, payments, receipts, expenses and business totals.

### Growing operators

Need a more dependable financial trail before adding more advanced financial or accounting workflows.

## Core user journey

    Create account
        ↓
    Create business
        ↓
    Add customers
        ↓
    Record a sale or create an invoice
        ↓
    Record payment
        ↓
    Create or view receipt
        ↓
    Review outstanding balances and reports

## Product areas

| Surface | Purpose | Current V1 |
| --- | --- | --- |
| Registration | Create an OpenBooks account | Live |
| Verification / recovery | Protect and recover account access | Live |
| Business onboarding | Create business profile and payment preferences | Live |
| Customers | Store customer identity and history | Live |
| Sales | Record direct sales | Live |
| Invoices | Create invoices and manage invoice state | Live |
| Public invoices | Let customers view a specific invoice without an account | Live |
| Payments | Record Cash, Bank Transfer and POS payments | Live |
| Receipts | Preserve proof of recorded payments | Live |
| Expenses | Record business expenses | Live |
| Reports | Show business financial summaries | Live |
| Paystack | Online provider integration | Deferred from V1 |

## Product boundaries

### Payment boundary

V1 records:

- Cash;
- Bank Transfer;
- POS.

Paystack is retained as a future provider boundary. The pitch deck must never describe Paystack as active V1 payment processing.

### Accounting boundary

OpenBooks is a bookkeeping and record-keeping product. It does not claim to replace every accounting, tax, audit or professional accounting workflow.

### Tenant boundary

A business owns its records. Users must only access records belonging to businesses they are authorized to access.

## Product language

Use:

- "simple bookkeeping";
- "financial records";
- "business records";
- "invoice and payment tracking";
- "Nigeria-first";
- "small businesses and freelancers";
- "free core" or "free V1".

Avoid:

- "full accounting replacement";
- "banking platform";
- "payment processor";
- "AI accounting" unless the product actually adds and documents AI functionality;
- "Paystack-powered" for V1;
- unsupported user, revenue, market-share or traction numbers.

## Evidence standard

External-facing claims should be traceable to one of:

1. a current feature in the codebase;
2. a documented current product boundary;
3. a measured product metric with a date and source;
4. a clearly labelled future plan.

Do not turn an intention into a present capability.

## Maintenance

When a product feature changes, update this document and the relevant engineering document.

The public pitch deck at /pitch-deck is based on this product document. A material product change should trigger a pitch-deck review.

## Related documents

- docs/ARCHITECTURE.md
- docs/CODEBASE-MAP.md
- docs/FINANCE.md
- docs/SECURITY.md
- docs/DEPLOYMENT.md
- docs/SEO.md
- docs/PITCH-DECK.md
