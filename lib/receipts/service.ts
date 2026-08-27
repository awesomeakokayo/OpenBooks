import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export async function nextReceiptNumber(tx: Prisma.TransactionClient, businessId: string): Promise<string> {
  const count = await tx.receipt.count({ where: { businessId } });
  const n = count + 1;
  return `REC-${String(n).padStart(6, "0")}`;
}

export async function issueReceipt(
  tx: Prisma.TransactionClient,
  params: { businessId: string; paymentId: string; invoiceId?: string | null; customerId: string; amount: number; paymentMethod: string }
) {
  // Idempotent per payment
  const existing = await tx.receipt.findUnique({ where: { paymentId: params.paymentId } });
  if (existing) return existing;

  const receiptNumber = await nextReceiptNumber(tx, params.businessId);
  return tx.receipt.create({
    data: {
      businessId: params.businessId,
      paymentId: params.paymentId,
      invoiceId: params.invoiceId || null,
      customerId: params.customerId,
      receiptNumber,
      amount: params.amount,
      paymentMethod: params.paymentMethod as never,
    },
  });
}
