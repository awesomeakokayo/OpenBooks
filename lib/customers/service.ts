import { prisma } from "@/lib/db/prisma";
import { customerSchema } from "@/lib/validation/schemas";
import { logAuditEvent } from "@/lib/audit/logger";
import { roundMoney } from "@/lib/invoices/utils";

export async function createCustomer(params: {
  businessId: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}) {
  const parsed = customerSchema.safeParse({ name: params.name, phone: params.phone, email: params.email, notes: params.notes });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Invalid customer details");

  const customer = await prisma.customer.create({
    data: {
      businessId: params.businessId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      notes: parsed.data.notes || null,
    },
  });

  await logAuditEvent({ businessId: params.businessId, userId: params.userId, action: "CUSTOMER_CREATED", entityType: "Customer", entityId: customer.id });
  return customer;
}

export async function listCustomers(businessId: string, search?: string, options: { page?: number; limit?: number } = {}) {
  const page = Number.isInteger(options.page) && (options.page ?? 1) > 0 ? options.page! : 1;
  const limit = Number.isInteger(options.limit) && (options.limit ?? 25) > 0 && (options.limit ?? 25) <= 100 ? options.limit! : 25;
  const where = {
    businessId,
    ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { phone: { contains: search, mode: "insensitive" as const } }] } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.customer.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * limit, take: limit }),
    prisma.customer.count({ where }),
  ]);
  return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function getCustomer(businessId: string, customerId: string) {
  return prisma.customer.findFirst({ where: { id: customerId, businessId }, include: { invoices: true, payments: true, sales: true } });
}

export async function calculateCustomerOutstanding(businessId: string, customerId: string) {
  const [invoiceAgg, paymentAgg] = await Promise.all([
    prisma.invoice.aggregate({ where: { businessId, customerId, status: { not: "CANCELLED" } }, _sum: { total: true } }),
    prisma.payment.aggregate({ where: { businessId, customerId, invoiceId: { not: null }, status: "SUCCESS" }, _sum: { amount: true } }),
  ]);
  const totalInvoiced = roundMoney(Number(invoiceAgg._sum.total ?? 0));
  const totalPaid = roundMoney(Number(paymentAgg._sum.amount ?? 0));
  return { totalInvoiced, totalPaid, outstanding: Math.max(0, roundMoney(totalInvoiced - totalPaid)) };
}

export async function getCustomerStats(businessId: string, customerId: string) {
  const [outstanding, salesAgg, invoiceCount] = await Promise.all([
    calculateCustomerOutstanding(businessId, customerId),
    prisma.sale.aggregate({ where: { businessId, customerId }, _sum: { totalAmount: true }, _count: true }),
    prisma.invoice.count({ where: { businessId, customerId } }),
  ]);
  return { ...outstanding, totalSales: roundMoney(Number(salesAgg._sum.totalAmount ?? 0)), salesCount: salesAgg._count, invoiceCount };
}
