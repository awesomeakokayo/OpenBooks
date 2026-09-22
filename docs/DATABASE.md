# OpenBooks Database

Prisma schema:

prisma/schema.prisma

Database provider:

PostgreSQL

## Mental model

~~~text
User
 ├── Account / Session / VerificationToken
 ├── BusinessMember ── Business
 │                       ├── Customer
 │                       ├── Product
 │                       ├── Invoice ── InvoiceItem
 │                       │            └── InvoicePaymentMethod
 │                       ├── Sale ── SaleItem
 │                       ├── Payment ── Receipt
 │                       ├── Expense
 │                       └── AuditEvent
 └── Business (owner relation)
~~~

## Core entities

### User

Identity for an OpenBooks account.

Important relationships:

- owns businesses;
- belongs to businesses through BusinessMember;
- owns Auth.js Account and Session records;
- may generate audit events.

### Business

The logical tenant and business profile.

Important fields include:

- identity/contact information;
- currency (V1 defaults to NGN);
- invoice and receipt sequences;
- payment settings;
- all business-owned financial/customer records.

### BusinessMember

Connects a user to a business with a role:

- OWNER;
- ADMIN;
- STAFF.

The database enforces unique user/business membership.

## Financial entities

### Customer

A business-owned customer record with optional email and notes.

Customer history connects to:

- invoices;
- sales;
- payments;
- receipts.

### Product

Optional reusable business item with a decimal unit price.

### Invoice

An invoice stores:

- business/customer relationship;
- business-scoped invoice number;
- public token;
- subtotal;
- discount;
- total;
- status;
- dates;
- notes.

Invoice statuses:

~~~text
DRAFT
SENT
VIEWED
PARTIALLY_PAID
PAID
OVERDUE
CANCELLED
~~~

### InvoiceItem

Line-level invoice description, quantity, unit price and calculated line total.

### InvoicePaymentMethod

Payment methods explicitly enabled/available for an invoice.

### Sale

A direct business sale. It is distinct from an invoice payment.

A Sale is not automatically an invoice payment and must not be reused to settle an invoice.

### Payment

A money-received record.

A payment may link to:

- a business;
- a customer;
- an invoice;
- a payment method;
- a provider;
- a status;
- provider metadata.

For V1, manual payment recording uses cash, bank transfer and POS.

### Receipt

A receipt corresponds to a recorded Payment.

The schema enforces one receipt per payment.

### Expense

Business cost record with amount, category, date and payment method.

### AuditEvent

Operational history of important business actions. It is an audit trail, not the accounting ledger.

## Money rules

Persisted financial amounts use Prisma Decimal(12,2).

Do not change financial persistence to binary floating-point numbers.

The invoice utility layer also handles conversion and rounding around NGN kobo boundaries.

## Tenant rules

Every business-owned record includes a business relationship either directly or through an owning Business relation.

The authorization helper:

lib/security/tenant.ts

must be used before protected business data is read or changed.

Database relations are not a substitute for application authorization. Both are necessary.

## Schema change workflow

For local development, create a migration with:

~~~bash
npx prisma migrate dev --name describe_change
~~~

Then regenerate the client:

~~~bash
npx prisma generate
~~~

Validate:

~~~bash
npx prisma validate
npx prisma format
~~~

### Important production note

The current Vercel build command is:

~~~text
prisma generate && next build
~~~

It does not apply database migrations.

When a schema change needs to reach production, the migration must be created and committed, then applied through the production migration workflow before the application relies on the new schema.

Use:

~~~bash
npx prisma migrate deploy
~~~

Never run prisma migrate dev against production and do not use prisma db push for production schema management.

The repository currently keeps prisma/schema.prisma and prisma/seed.ts as the visible Prisma source files. When production migration history is introduced or extended, commit the generated prisma/migrations/ directory so releases have a reproducible schema history.

Before changing a field or relation:

1. find every service/API/page that uses it;
2. inspect delete behavior and indexes;
3. update tests;
4. update this document;
5. verify tenant isolation and financial invariants still hold.

## Destructive changes

Do not casually delete or rename financial fields.

For a destructive migration, document:

- why the field/relation is no longer needed;
- how existing records are migrated;
- whether old application versions can coexist;
- what rollback means;
- how production backup/recovery protects the change.

Use backup.md for recovery guidance.
