
# Paystack Settlement Model — Future Reference

## Status

**Not active in OpenBooks V1.**

The current V1 API intentionally returns 410 Gone for Paystack initialize, verify and webhook endpoints. V1 uses manual Cash, Bank Transfer and POS payment recording.

This document is retained so a future engineer does not have to reconstruct the earlier provider design from old code or chat history.

## Intended boundary

When Paystack is eventually introduced, it should remain a provider-specific layer behind a payment-provider boundary.

Conceptually:

~~~text
OpenBooks invoice
      ↓
provider adapter
      ↓
external checkout
      ↓
provider verification/webhook
      ↓
OpenBooks payment record
      ↓
receipt + invoice status
~~~

OpenBooks must not treat a browser redirect as proof of payment.

## Required future controls

A future Paystack implementation must be designed and tested for:

- server-side transaction verification;
- webhook authenticity verification;
- exact invoice/business/customer association;
- amount and currency verification;
- idempotent processing;
- duplicate webhook handling;
- safe retry behavior;
- provider failure states;
- refund/reversal semantics;
- settlement/reconciliation;
- provider-specific onboarding/compliance requirements.

## Existing schema boundary

The Prisma schema already contains provider-oriented payment fields and a business field reserved for a future settlement/subaccount model.

Do not enable those fields in V1 UI simply because the schema can represent them.

## Non-goals for V1

V1 does not:

- initialize online Paystack transactions;
- verify Paystack transactions;
- accept Paystack webhook events;
- act as a wallet;
- hold customer funds.

## Future implementation checklist

Before activating Paystack:

1. write the product/payment contract;
2. decide the settlement architecture;
3. implement the provider adapter;
4. add server-side verification;
5. add webhook authentication;
6. make processing idempotent;
7. test partial/final payment behavior;
8. test failures/retries/refunds;
9. review tenant isolation and secret handling;
10. update SECURITY.md, INTEGRATIONS.md, DATABASE.md and deployment documentation;
11. run the full release gate.

No live-money provider should be reactivated by restoring an old code path without this review.
