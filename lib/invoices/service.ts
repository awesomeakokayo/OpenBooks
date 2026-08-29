import { prisma } from "@/lib/db/prisma";
import { generatePublicToken, calculateInvoiceTotal, calculateLineTotal } from "./utils";
import { logAuditEvent } from "@/lib/audit/logger";
import type { InvoiceStatus, PaymentMethod } from "@prisma/client";

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

export async function nextInvoiceNumber(businessId: string): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const count = await tx.invoice.count({ where: { businessId } });
    const n = count + 1;
    const candidate = `INV-${String(n).padStart(6, "0")}`;
    const exists = await tx.invoice.findFirst({ where: { businessId, invoiceNumber: candidate } });
    if (exists) return `INV-${String(n).padStart(6, "0")}-${Date.now().toString().slice(-4)}`;
    return candidate;
  });
}

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

  const discount = Number.isFinite(params.discount ?? 0) ? params.discount ?? 0 : 0;
  const { subtotal, total } = calculateInvoiceTotal(params.items, discount);
  const invoiceNumber = await nextInvoiceNumber(params.businessId);
  const publicToken = generatePublicToken();

  let methods = params.paymentMethods;
  if (!methods || methods.length === 0) {
    const setting = await prisma.businessPaymentSetting.findUnique({ where: { businessId: params.businessId } });
    if (setting) {
      methods = [];
      if (setting.bankTransferEnabled) methods.push("BANK_TRANSFER" as PaymentMethod);
      if (setting.cashEnabled) methods.push("CASH" as PaymentMethod);
      if (setting.posEnabled) methods.push("POS" as PaymentMethod);
      if (setting.paystackEnabled) methods.push("PAYSTACK" as PaymentMethod);
      if (methods.length === 0) methods.push("BANK_TRANSFER" as PaymentMethod);
    } else {
      methods = ["BANK_TRANSFER" as PaymentMethod];
    }
  }

  const invoice = await prisma.invoice.create({
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
      paymentMethods: { create: methods!.map((m) => ({ method: m })) },
    },
    include: { items: true, paymentMethods: true, customer: true },
  });

  await logAuditEvent({
    businessId: params.businessId,
    userId: params.userId,
    action: "INVOICE_CREATED",
    entityType: "Invoice",
    entityId: invoice.id,
    metadata: { invoiceNumber, total },
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
