import { prisma } from "@/lib/db/prisma";
import { logAuditEvent } from "@/lib/audit/logger";
import { roundMoney } from "@/lib/invoices/utils";
import type { PaymentMethod } from "@prisma/client";

const V1_PAYMENT_METHODS: PaymentMethod[] = ["CASH", "BANK_TRANSFER", "POS"];

export async function recordSale(params: {
  businessId: string;
  userId: string;
  customerId?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  paymentMethod?: PaymentMethod | null;
  saleDate?: Date;
  notes?: string;
}) {
  if (!params.description?.trim()) throw new Error("Description required");
  if (!Number.isFinite(params.quantity) || params.quantity <= 0) throw new Error("Quantity must be > 0");
  if (!Number.isFinite(params.unitPrice) || params.unitPrice <= 0) throw new Error("Unit price must be > 0");

  const subtotal = roundMoney(params.quantity * params.unitPrice);
  const discount = roundMoney(params.discount ?? 0);
  if (discount > subtotal) throw new Error("Discount cannot exceed the sale subtotal");
  const totalAmount = roundMoney(subtotal - discount);

  if (params.paymentMethod && !V1_PAYMENT_METHODS.includes(params.paymentMethod)) {
    throw new Error("Payment method is not supported in OpenBooks V1");
  }

  if (params.customerId) {
    const cust = await prisma.customer.findFirst({ where: { id: params.customerId, businessId: params.businessId } });
    if (!cust) throw new Error("Customer not found in this business");
  }

  if (params.paymentMethod) {
    const setting = await prisma.businessPaymentSetting.findUnique({ where: { businessId: params.businessId } });
    if (!setting) throw new Error("Payment settings are not configured for this business");
    const methodEnabled =
      (params.paymentMethod === "CASH" && setting.cashEnabled) ||
      (params.paymentMethod === "BANK_TRANSFER" && setting.bankTransferEnabled) ||
      (params.paymentMethod === "POS" && setting.posEnabled);
    if (!methodEnabled) throw new Error("This payment method is not enabled for the business");
  }

  const sale = await prisma.sale.create({
    data: {
      businessId: params.businessId,
      customerId: params.customerId || null,
      description: params.description.trim(),
      quantity: params.quantity,
      unitPrice: roundMoney(params.unitPrice),
      discount,
      totalAmount,
      paymentMethod: params.paymentMethod || null,
      saleDate: params.saleDate ?? new Date(),
      notes: params.notes?.trim() || null,
    },
  });

  await logAuditEvent({ businessId: params.businessId, userId: params.userId, action: "SALE_RECORDED", entityType: "Sale", entityId: sale.id, metadata: { totalAmount } });
  return sale;
}

export async function listSales(businessId: string, options: { page?: number; limit?: number } = {}) {
  const page = Number.isInteger(options.page) && (options.page ?? 1) > 0 ? options.page! : 1;
  const limit = Number.isInteger(options.limit) && (options.limit ?? 25) > 0 && (options.limit ?? 25) <= 100 ? options.limit! : 25;
  const where = { businessId };
  const [items, total] = await Promise.all([
    prisma.sale.findMany({ where, include: { customer: true }, orderBy: [{ saleDate: "desc" }, { id: "desc" }], skip: (page - 1) * limit, take: limit }),
    prisma.sale.count({ where }),
  ]);
  return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
