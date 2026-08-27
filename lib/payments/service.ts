import { prisma } from "@/lib/db/prisma";
import { logAuditEvent } from "@/lib/audit/logger";
import { issueReceipt } from "@/lib/receipts/service";
import type { PaymentMethod } from "@prisma/client";

function deriveInvoiceStatus(total: number, totalPaid: number, dueDate: Date | null): string {
  if (totalPaid >= total && total > 0) return "PAID";
  if (totalPaid > 0 && totalPaid < total) {
    if (dueDate && new Date() > dueDate) return "OVERDUE";
    return "PARTIALLY_PAID";
  }
  if (dueDate && new Date() > dueDate) return "OVERDUE";
  // keep existing SENT/VIEWED if no payment yet — caller decides
  return "SENT";
}

export async function recordManualPayment(params: {
  businessId: string;
  userId: string;
  customerId: string;
  invoiceId?: string | null;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}) {
  if (params.amount <= 0) throw new Error("Amount must be greater than 0");
  if (!["CASH", "BANK_TRANSFER", "POS"].includes(params.method)) {
    throw new Error("Method must be CASH, BANK_TRANSFER or POS for manual payments");
  }

  // Verify customer belongs to business
  const customer = await prisma.customer.findFirst({
    where: { id: params.customerId, businessId: params.businessId },
  });
  if (!customer) throw new Error("Customer not found in this business");

  let invoice: { id: string; total: unknown; status: string; dueDate: Date | null } | null = null;
  if (params.invoiceId) {
    const inv = await prisma.invoice.findFirst({
      where: { id: params.invoiceId, businessId: params.businessId },
      include: { payments: { where: { status: "SUCCESS" } } },
    });
    if (!inv) throw new Error("Invoice not found in this business");
    if (inv.status === "CANCELLED") throw new Error("Cannot pay cancelled invoice");
    if (inv.status === "PAID") throw new Error("Invoice already paid");

    const total = Number(inv.total);
    const totalPaid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
    const outstanding = Math.max(0, total - totalPaid);
    if (params.amount > outstanding) {
      throw new Error(`Amount exceeds outstanding ₦${outstanding.toLocaleString("en-NG")}`);
    }
    invoice = { id: inv.id, total: inv.total, status: inv.status, dueDate: inv.dueDate };
  }

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        businessId: params.businessId,
        invoiceId: params.invoiceId || null,
        customerId: params.customerId,
        amount: params.amount,
        currency: "NGN",
        method: params.method,
        provider: "MANUAL",
        status: "SUCCESS",
        verificationType: "MANUAL",
        verifiedAt: new Date(),
        metadata: params.notes ? ({ notes: params.notes, reference: params.reference } as never) : undefined,
      },
    });

    const receipt = await issueReceipt(tx, {
      businessId: params.businessId,
      paymentId: payment.id,
      invoiceId: params.invoiceId || null,
      customerId: params.customerId,
      amount: params.amount,
      paymentMethod: params.method,
    });

    if (invoice) {
      // Recalculate status after this payment
      const allPayments = await tx.payment.findMany({
        where: { invoiceId: invoice.id, status: "SUCCESS" },
        select: { amount: true },
      });
      const total = Number(invoice.total);
      const totalPaid = allPayments.reduce((s, p) => s + Number(p.amount), 0);
      let nextStatus = deriveInvoiceStatus(total, totalPaid, invoice.dueDate);

      // Preserve VIEWED/SENT nuance if no payment yet not applicable, but here we have payment
      if (nextStatus === "SENT" && invoice.status === "VIEWED") nextStatus = "VIEWED";

      await tx.invoice.update({ where: { id: invoice.id }, data: { status: nextStatus as never } });
      return { payment, receipt, nextStatus };
    }

    return { payment, receipt, nextStatus: null };
  });

  await logAuditEvent({
    businessId: params.businessId,
    userId: params.userId,
    action: "PAYMENT_RECORDED",
    entityType: "Payment",
    entityId: result.payment.id,
    metadata: { amount: params.amount, method: params.method, invoiceId: params.invoiceId },
  });

  return result;
}

export async function listPayments(businessId: string) {
  return prisma.payment.findMany({
    where: { businessId },
    include: { customer: true, invoice: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
