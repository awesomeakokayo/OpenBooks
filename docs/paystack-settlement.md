# Paystack Settlement Model — OpenBooks NG

## Decision
We use **Paystack Standard + Subaccount settlement** without OpenBooks acting as wallet.

Flow:
```
Customer
  ↓
Paystack Checkout (initialized with subaccount)
  ↓
Paystack settles to Business subaccount bank account
  ↓ (Paystack settlement schedule, fees deducted)
Business bank account
```

OpenBooks only records the transaction; never holds customer funds.

## Why Subaccount
- Paystack subaccount (`ACCT_xxx`) represents each business's settlement destination.
- Initialize call includes `subaccount: business.paystackSubaccountCode` when present.
- If no subaccount, funds settle to platform account — we still record but
  ops must reconcile manually. V1 therefore allows `subaccount` null and still
  works as record-only.

## Onboarding (V1 minimal)
1. Business enables Paystack in Payment Settings → we store `paystackSubaccountCode` (optional).
2. For hosted OpenBooks: platform owner creates subaccount via `POST /subaccount`
   with business bank details + percentage charge (e.g., business gets 100% minus
   Paystack fees). Requires `bank_code`, `account_number`, `business_name`.
3. Future: KYC per Paystack docs — business must provide valid bank account
   that Paystack can verify; no secret key ever stored from business.

## Initialize Contract
`POST /transaction/initialize`:
```json
{
  "amount": "<outstanding * 100 kobo>",
  "email": "customer.email || business.email || fallback",
  "reference": "OB_<invoiceId>_<timestamp>_<random>",
  "callback_url": "${APP_URL}/invoice/${publicToken}?reference=<ref>",
  "subaccount": "ACCT_xxx (if present)",
  "metadata": { "businessId", "invoiceId", "customerId", "publicToken" }
}
```

Stored as `Payment { provider PAYSTACK, status PENDING, providerReference = reference }`.

## Verification (Source of Truth)
- Browser redirect `?reference=` is NOT trusted.
- Webhook `POST /api/webhooks/paystack` with `x-paystack-signature = HMAC_SHA512(secret, rawBody)` is validated, then server `GET /transaction/verify/:reference` is called.
- We confirm: `status === "success"`, `currency === "NGN"`, `amount === expectedOutstandingKobo`, `businessId` matches invoice.businessId via `providerReference` lookup or metadata.
- Idempotency: `findUnique Payment where providerReference = reference` → if exists, 200 without duplicate.
- Then create `Payment { SUCCESS, AUTOMATIC, verifiedAt }`, update invoice status
  (PARTIALLY_PAID → PAID when totalPaid >= total), create receipt atomically.

## Fees / Settlement Schedule
Per Paystack docs at production time — typically T+1 settlement, fees ~1.5% + ₦100 capped.
OpenBooks does not deduct extra fee in V1; platform fee can be added via subaccount `percentage_charge`.

## Keys
- `PAYSTACK_SECRET_KEY` server-only (env), `PAYSTACK_PUBLIC_KEY` not needed server-side except for reference.
- `PAYSTACK_WEBHOOK_SECRET` is actually the same secret used for HMAC (Paystack uses secret key).

## Current Limitation
Direct bank-transfer via Paystack Dedicated Virtual Account is V2; V1 uses
online card/bank checkout only. Manual BANK_TRANSFER remains manual until DVA.

## References
- Paystack docs: Transaction initialize, Verify, Webhooks, Subaccounts
- Verification prerequisite per buildversion.md:1132 before live money
