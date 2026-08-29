import { prisma } from "@/lib/db/prisma";
import { logAuditEvent } from "@/lib/audit/logger";
import { roundMoney } from "@/lib/invoices/utils";

export async function recordSale(params: {
  businessId: string;
  userId: string;
  customerId?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  paymentMethod?: string;
  saleDate?: Date;
  notes?: string;
}) {
  if (!params.description?.trim()) throw new Error("Description required");
  if (!Number.isFinite(params.quantity) || params.quantity <= 0) throw new Error("Quantity must be > 0");
  if (!Number.isFinite(params.unitPrice) || params.unitPrice <= 0) throw new Error("Unit price must be > 0");

  const discount = roundMoney(params.discount ?? 0);
  const totalAmount = Math.max(0, roundMoney(params.quantity * params.unitPrice - discount));

  if (params.customerId) {
    const cust = await prisma.customer.findFirst({ where: { id: params.customerId, businessId: params.businessId } });
    if (!cust) throw new Error("Customer not found in this business");
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
      paymentMethod: params.paymentMethod as never,
      saleDate: params.saleDate ?? new Date(),
      notes: params.notes?.trim() || null,
    },
  });

  await logAuditEvent({
    businessId: params.businessId,
    userId: params.userId,
    action: "SALE_RECORDED",
    entityType: "Sale",
    entityId: sale.id,
    metadata: { totalAmount },
  });

  return sale;
}

export async function listSales(businessId: string) {
  return prisma.sale.findMany({
    where: { businessId },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
