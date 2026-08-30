import type { PaymentStatus } from "@prisma/client";
import { roundMoney } from "@/lib/invoices/utils";

/**
 * OpenBooks V1 financial contract.
 *
 * A direct Sale represents a completed standalone business sale.
 * A Payment represents money received against an Invoice (or a standalone
 * manual payment when no invoice exists).
 *
 * Dashboard/report "sales" currently means money recorded/received. The
 * frontend must never infer that an Invoice total itself is revenue received.
 */
export function isSuccessfulPayment(status: PaymentStatus) {
  return status === "SUCCESS";
}

export function invoiceAmountPaid(
  invoiceTotal: number,
  payments: Array<{ amount: number; status: PaymentStatus }>
) {
  const paid = payments
    .filter((payment) => isSuccessfulPayment(payment.status))
    .reduce((sum, payment) => sum + Number(payment.amount), 0);
  return roundMoney(Math.min(Math.max(0, paid), Math.max(0, invoiceTotal)));
}

export function invoiceOutstanding(
  invoiceTotal: number,
  payments: Array<{ amount: number; status: PaymentStatus }>
) {
  return Math.max(0, roundMoney(Number(invoiceTotal) - invoiceAmountPaid(invoiceTotal, payments)));
}

/**
 * Prevents direct-sale values from being used to settle an invoice. A Sale is
 * independent activity; only a payment carrying the invoice id can reduce an
 * invoice balance.
 */
export function canApplyPaymentToInvoice(params: {
  paymentInvoiceId: string | null;
  invoiceId: string;
}) {
  return params.paymentInvoiceId === params.invoiceId;
}
