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
  try {
    return await tx.receipt.create({
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
  } catch (e: unknown) {
    // Unique constraint race fallback — retry once with suffixed number
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Unique constraint") || msg.includes("receiptNumber")) {
      const fallback = `${receiptNumber}-${Date.now().toString().slice(-4)}`;
      return tx.receipt.create({
        data: {
          businessId: params.businessId,
          paymentId: params.paymentId,
          invoiceId: params.invoiceId || null,
          customerId: params.customerId,
          receiptNumber: fallback,
          amount: params.amount,
          paymentMethod: params.paymentMethod as never,
        },
      });
    }
    throw e;
  }
}
