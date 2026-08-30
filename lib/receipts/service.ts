import type { Prisma } from "@prisma/client";

/** Atomically increments the per-business receipt sequence. */
export async function nextReceiptNumber(tx: Prisma.TransactionClient, businessId: string): Promise<string> {
  const business = await tx.business.update({
    where: { id: businessId },
    data: { receiptSequence: { increment: 1 } },
    select: { receiptSequence: true },
  });

  return `REC-${String(business.receiptSequence).padStart(6, "0")}`;
}

export async function issueReceipt(
  tx: Prisma.TransactionClient,
  params: { businessId: string; paymentId: string; invoiceId?: string | null; customerId: string; amount: number; paymentMethod: string }
) {
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
