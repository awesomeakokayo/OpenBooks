import { prisma } from "@/lib/db/prisma";
import { generatePublicToken, calculateInvoiceTotal, calculateLineTotal } from "./utils";
import { logAuditEvent } from "@/lib/audit/logger";
import type { InvoiceStatus, PaymentMethod, Prisma } from "@prisma/client";

export const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["SENT", "CANCELLED"],
  SENT: ["VIEWED", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"],
  VIEWED: ["PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"],
  PARTIALLY_PAID: ["PAID", "OVERDUE", "CANCELLED"],
  PAID: [],
  OVERDUE: ["PARTIALLY_PAID", "PAID", "CANCELLED"],
  CANCELLED: [],
};

export function canTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Atomically increments the per-business invoice sequence. The returned
 * sequence value is the source of truth for the next invoice number.
 */
export async function nextInvoiceNumber(tx: Prisma.TransactionClient, businessId: string): Promise<string> {
  const business = await tx.business.update({
    where: { id: businessId },
    data: { invoiceSequence: { increment: 1 } },
    select: { invoiceSequence: true },
  });

  return `INV-${String(business.invoiceSequence).padStart(6, "0")}`;
}

const V1_PAYMENT_METHODS: PaymentMethod[] = ["CASH", "BANK_TRANSFER", "POS"];

export async function createInvoice(params: {
  businessId: string;
  userId: string;
  customerId: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  discount?: number;
  dueDate?: string | null;
  notes?: string;
  paymentMethods?: PaymentMethod[];
}) {
  if (!params.items.length) throw new Error("At least one item required");
  params.items.forEach((it) => {
    if (!it.description?.trim()) throw new Error("Item description required");
    if (!Number.isFinite(it.quantity) || it.quantity <= 0) throw new Error("Quantity must be > 0");
    if (!Number.isFinite(it.unitPrice) || it.unitPrice <= 0) throw new Error("Unit price must be > 0");
  });

  const customer = await prisma.customer.findFirst({
    where: { id: params.customerId, businessId: params.businessId },
  });
  if (!customer) throw new Error("Customer not found in this business");

  const setting = await prisma.businessPaymentSetting.findUnique({ where: { businessId: params.businessId } });
  if (!setting) throw new Error("Payment settings are not configured for this business");

  const enabledByBusiness = new Set<PaymentMethod>();
  if (setting.bankTransferEnabled) enabledByBusiness.add("BANK_TRANSFER");
  if (setting.cashEnabled) enabledByBusiness.add("CASH");
  if (setting.posEnabled) enabledByBusiness.add("POS");

  let methods = params.paymentMethods;
  if (!methods || methods.length === 0) {
    methods = V1_PAYMENT_METHODS.filter((method) => enabledByBusiness.has(method));
  }

  if (!methods.length) throw new Error("Enable at least one payment method before creating an invoice");
  if (methods.some((method) => !V1_PAYMENT_METHODS.includes(method) || !enabledByBusiness.has(method))) {
    throw new Error("Invoice contains a payment method that is not enabled for this business");
  }

  if (methods.includes("BANK_TRANSFER")) {
    if (!setting.bankTransferEnabled || !setting.bankName || !setting.accountName || !setting.accountNumber) {
      throw new Error("Complete bank transfer details before enabling bank transfer on an invoice");
    }
  }

  const discount = Number.isFinite(params.discount ?? 0) ? params.discount ?? 0 : 0;
  const { subtotal, total } = calculateInvoiceTotal(params.items, discount);
  const publicToken = generatePublicToken();

  const invoice = await prisma.$transaction(async (tx) => {
    const invoiceNumber = await nextInvoiceNumber(tx, params.businessId);

    return tx.invoice.create({
      data: {
        businessId: params.businessId,
        customerId: params.customerId,
        invoiceNumber,
        publicToken,
        subtotal,
        discount,
        total,
        issueDate: new Date(),
        dueDate: params.dueDate ? new Date(params.dueDate) : null,
        notes: params.notes?.trim() || null,
        status: "DRAFT" as InvoiceStatus,
        items: {
          create: params.items.map((it) => ({
            description: it.description.trim(),
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            lineTotal: calculateLineTotal(it.quantity, it.unitPrice),
          })),
        },
        paymentMethods: { create: methods.map((m) => ({ method: m })) },
      },
      include: { items: true, paymentMethods: true, customer: true },
    });
  });

  await logAuditEvent({
    businessId: params.businessId,
    userId: params.userId,
    action: "INVOICE_CREATED",
    entityType: "Invoice",
    entityId: invoice.id,
    metadata: { invoiceNumber: invoice.invoiceNumber, total, paymentMethods: methods },
  });

  return invoice;
}

export async function transitionInvoiceStatus(invoiceId: string, to: InvoiceStatus) {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) throw new Error("Invoice not found");
  if (!canTransition(invoice.status, to)) throw new Error(`Cannot transition from ${invoice.status} to ${to}`);
  return prisma.invoice.update({ where: { id: invoiceId }, data: { status: to } });
}

export async function getInvoiceByPublicToken(token: string) {
  return prisma.invoice.findUnique({
    where: { publicToken: token },
    include: {
      business: { include: { paymentSetting: true } },
      customer: true,
      items: true,
      paymentMethods: true,
      payments: { where: { status: "SUCCESS" } },
    },
  });
}
