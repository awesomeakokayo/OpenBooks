import { prisma } from "@/lib/db/prisma";
import { logAuditEvent } from "@/lib/audit/logger";
import { issueReceipt } from "@/lib/receipts/service";
import { roundMoney } from "@/lib/invoices/utils";
import { Prisma, type InvoiceStatus, type PaymentMethod } from "@prisma/client";

function deriveInvoiceStatus(total: number, totalPaid: number, dueDate: Date | null): InvoiceStatus {
  const safeTotal = roundMoney(total);
  const safePaid = roundMoney(totalPaid);
  if (safePaid >= safeTotal && safeTotal > 0) return "PAID";
  if (safePaid > 0 && safePaid < safeTotal) {
    if (dueDate && new Date() > dueDate) return "OVERDUE";
    return "PARTIALLY_PAID";
  }
  if (dueDate && new Date() > dueDate) return "OVERDUE";
  return "SENT";
}

const MANUAL_PAYMENT_METHODS: PaymentMethod[] = ["CASH", "BANK_TRANSFER", "POS"];
const MAX_SERIALIZATION_RETRIES = 3;

function isSerializationConflict(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  const amount = roundMoney(params.amount);
  if (amount <= 0) throw new Error("Amount must be greater than 0");
  if (!MANUAL_PAYMENT_METHODS.includes(params.method)) {
    throw new Error("Method must be CASH, BANK_TRANSFER or POS for manual payments");
  }

  let result: {
    payment: Awaited<ReturnType<typeof prisma.payment.create>>;
    receipt: Awaited<ReturnType<typeof prisma.receipt.create>>;
    nextStatus: InvoiceStatus | null;
  } | null = null;

  for (let attempt = 1; attempt <= MAX_SERIALIZATION_RETRIES; attempt += 1) {
    try {
      result = await prisma.$transaction(async (tx) => {
        const [customer, setting] = await Promise.all([
          tx.customer.findFirst({ where: { id: params.customerId, businessId: params.businessId } }),
          tx.businessPaymentSetting.findUnique({ where: { businessId: params.businessId } }),
        ]);
        if (!customer) throw new Error("Customer not found in this business");
        if (!setting) throw new Error("Payment settings are not configured for this business");

        const methodEnabled =
          (params.method === "CASH" && setting.cashEnabled) ||
          (params.method === "BANK_TRANSFER" && setting.bankTransferEnabled) ||
          (params.method === "POS" && setting.posEnabled);
        if (!methodEnabled) throw new Error("This payment method is not enabled for the business");

        let invoice: { id: string; total: unknown; status: InvoiceStatus; dueDate: Date | null } | null = null;
        if (params.invoiceId) {
          const inv = await tx.invoice.findFirst({
            where: { id: params.invoiceId, businessId: params.businessId, customerId: params.customerId },
            include: { payments: { where: { status: "SUCCESS" }, select: { amount: true } } },
          });
          if (!inv) throw new Error("Invoice not found for this customer");
          if (inv.status === "CANCELLED") throw new Error("Cannot pay cancelled invoice");
          if (inv.status === "PAID") throw new Error("Invoice already paid");

          const total = roundMoney(Number(inv.total));
          const totalPaid = roundMoney(inv.payments.reduce((sum, payment) => sum + Number(payment.amount), 0));
          const outstanding = Math.max(0, roundMoney(total - totalPaid));
          if (amount > outstanding) throw new Error(`Amount exceeds outstanding ₦${outstanding.toLocaleString("en-NG")}`);
          invoice = { id: inv.id, total: inv.total, status: inv.status, dueDate: inv.dueDate };
        }

        const metadata: Prisma.InputJsonValue | undefined = params.notes || params.reference
          ? { notes: params.notes ?? null, reference: params.reference ?? null }
          : undefined;

        const payment = await tx.payment.create({
          data: {
            businessId: params.businessId,
            invoiceId: params.invoiceId || null,
            customerId: params.customerId,
            amount,
            currency: "NGN",
            method: params.method,
            provider: "MANUAL",
            status: "SUCCESS",
            verificationType: "MANUAL",
            verifiedAt: new Date(),
            metadata,
          },
        });

        const receipt = await issueReceipt(tx, {
          businessId: params.businessId,
          paymentId: payment.id,
          invoiceId: params.invoiceId || null,
          customerId: params.customerId,
          amount,
          paymentMethod: params.method,
        });

        if (invoice) {
          const allPayments = await tx.payment.findMany({ where: { invoiceId: invoice.id, status: "SUCCESS" }, select: { amount: true } });
          const total = roundMoney(Number(invoice.total));
          const totalPaid = roundMoney(allPayments.reduce((sum, payment) => sum + Number(payment.amount), 0));
          let nextStatus = deriveInvoiceStatus(total, totalPaid, invoice.dueDate);
          if (nextStatus === "SENT" && invoice.status === "VIEWED") nextStatus = "VIEWED";
          await tx.invoice.update({ where: { id: invoice.id }, data: { status: nextStatus } });
          return { payment, receipt, nextStatus };
        }

        return { payment, receipt, nextStatus: null };
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      break;
    } catch (error) {
      if (!isSerializationConflict(error) || attempt === MAX_SERIALIZATION_RETRIES) throw error;
      await sleep(25 * attempt);
    }
  }

  if (!result) throw new Error("Could not record payment");
  await logAuditEvent({ businessId: params.businessId, userId: params.userId, action: "PAYMENT_RECORDED", entityType: "Payment", entityId: result.payment.id, metadata: { amount, method: params.method, invoiceId: params.invoiceId } });
  return result;
}

export async function listPayments(businessId: string, options: { page?: number; limit?: number } = {}) {
  const rawPage = options.page ?? 1;
  const rawLimit = options.limit ?? 25;
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = Number.isInteger(rawLimit) && rawLimit > 0 && rawLimit <= 100 ? rawLimit : 25;
  const [items, total] = await Promise.all([
    prisma.payment.findMany({ where: { businessId }, include: { customer: true, invoice: true }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * limit, take: limit }),
    prisma.payment.count({ where: { businessId } }),
  ]);
  return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
