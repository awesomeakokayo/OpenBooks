
# OpenBooks Financial Rules

This document is the safety reference for financial behavior. When a financial screen and the service disagree, the service and financial contract are the places to start.

## Core definitions

### Sale

A Sale is a direct business transaction recorded independently from invoices.

It represents a completed standalone sale and must not be treated as an invoice payment.

### Payment

A Payment represents money received.

A Payment can optionally belong to an Invoice.

Only a successful Payment linked to an Invoice can reduce that Invoice's outstanding balance.

### Receipt

A Receipt is issued for a recorded Payment.

The database enforces one Receipt per Payment.

## Invoice math

For an Invoice:

~~~text
amountPaid
  = sum of successful invoice-linked payments

outstanding
  = max(invoice.total - amountPaid, 0)
~~~

Invoice status is derived from the amount received and due date.

The authoritative implementation is in:

- lib/finance/contract.ts
- lib/payments/service.ts

## Important invariant

An unrelated transaction must never change an invoice balance.

This means:

~~~text
Sale for Customer A
      ✕
cannot settle
      ↓
Invoice B
~~~

Only a Payment that carries the correct invoice relationship may reduce that invoice's outstanding amount.

## Money representation

Persisted financial amounts use Prisma Decimal(12,2).

The invoice utility layer also handles NGN/kobo-safe arithmetic around JavaScript number boundaries.

Primary implementation:

lib/invoices/utils.ts

Do not introduce binary floating-point persistence for financial amounts.

## Invoice total calculation

Client values are input, not authoritative totals.

The server recalculates:

~~~text
line quantity × line unit price
          ↓
line total
          ↓
subtotal
          ↓
discount
          ↓
invoice total
~~~

The implementation rounds through kobo boundaries to avoid fractional-kobo drift.

## Payment recording

Current V1 manual payment methods are:

- Cash;
- Bank Transfer;
- POS.

A manual payment is created in a serializable Prisma transaction.

The transaction:

1. verifies the customer belongs to the business;
2. verifies payment settings;
3. verifies the selected method is enabled;
4. verifies the invoice/customer relationship when an invoice is supplied;
5. calculates the current outstanding amount;
6. rejects overpayment;
7. creates the Payment;
8. creates the Receipt;
9. recalculates the invoice status;
10. records an audit event.

Serialization conflicts are retried a small number of times.

## Dashboard/reporting definition

The dashboard/reporting layer must distinguish:

- money received;
- invoices issued;
- direct sales;
- expenses;
- customer outstanding.

An Invoice total is not automatically money received.

The shared financial contract exists to prevent different pages from inventing slightly different definitions.

## Reporting time

Business month/reporting windows use Nigeria local time:

Africa/Lagos

Do not switch financial reporting to the server's default timezone.

Primary implementation:

lib/reports/months.ts

## Invoice states

Current invoice states:

~~~text
DRAFT
SENT
VIEWED
PARTIALLY_PAID
PAID
OVERDUE
CANCELLED
~~~

Do not add an ad-hoc status transition in a page or API handler. Use the existing invoice state logic.

## Sequencing

Invoice and receipt numbers are business-scoped sequences.

Sequence generation is concurrency-sensitive. Never replace atomic sequencing with a simple read-current-value-plus-one operation.

## Failure and reversal behavior

Failed or cancelled Payment records must not count as money received.

Future refund/reversal behavior needs an explicit financial rule before implementation.

Do not silently reuse a status for refunds without deciding:

- whether the money should reduce historical received totals;
- whether the Receipt remains valid;
- whether the Invoice status changes;
- whether the Customer balance changes;
- how reports represent the reversal.

## Financial change checklist

Before changing a financial rule:

- identify the current invariant;
- update the service/contract first;
- add a regression test;
- inspect dashboard and reports;
- inspect customer/invoice/payment/receipt views;
- verify direct-sale and invoice-payment separation;
- verify tenant isolation;
- update this document.

For serious financial changes, run the full test and production build gate.
