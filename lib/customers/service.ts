import { prisma } from "@/lib/db/prisma";
import { customerSchema } from "@/lib/validation/schemas";
import { logAuditEvent } from "@/lib/audit/logger";

export async function createCustomer(params: {
  businessId: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}) {
  const parsed = customerSchema.safeParse({
    name: params.name,
    phone: params.phone,
    email: params.email,
    notes: params.notes,
  });
  if (!parsed.success) throw new Error(parsed.error.message);

  const customer = await prisma.customer.create({
    data: {
      businessId: params.businessId,
      name: params.name.trim(),
      phone: params.phone.trim(),
      email: params.email?.trim() || null,
      notes: params.notes?.trim() || null,
    },
  });

  await logAuditEvent({
    businessId: params.businessId,
    userId: params.userId,
    action: "CUSTOMER_CREATED",
    entityType: "Customer",
    entityId: customer.id,
  });

  return customer;
}

export async function listCustomers(businessId: string, search?: string) {
  const where: Record<string, unknown> = { businessId };
  if (search) {
    (where as Record<string, unknown>).OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }
  return prisma.customer.findMany({
    where: where as never,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getCustomer(businessId: string, customerId: string) {
  return prisma.customer.findFirst({
    where: { id: customerId, businessId },
    include: { invoices: true, payments: true, sales: true },
  });
}

/**
 * Derived outstanding = sum(invoice totals) - sum(SUCCESS payments)
 * Records are authoritative, not cached balance.
 */
export async function calculateCustomerOutstanding(businessId: string, customerId: string) {
  const [invoiceAgg, paymentAgg] = await Promise.all([
    prisma.invoice.aggregate({
      where: { businessId, customerId, status: { not: "CANCELLED" } },
      _sum: { total: true },
    }),
    prisma.payment.aggregate({
      where: { businessId, customerId, status: "SUCCESS" },
      _sum: { amount: true },
    }),
  ]);
  const totalInvoiced = Number(invoiceAgg._sum.total ?? 0);
  const totalPaid = Number(paymentAgg._sum.amount ?? 0);
  const outstanding = Math.max(0, totalInvoiced - totalPaid);
  return { totalInvoiced, totalPaid, outstanding };
}

export async function getCustomerStats(businessId: string, customerId: string) {
  const [outstanding, salesAgg, invoiceCount] = await Promise.all([
    calculateCustomerOutstanding(businessId, customerId),
    prisma.sale.aggregate({
      where: { businessId, customerId },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.invoice.count({ where: { businessId, customerId } }),
  ]);
  return {
    ...outstanding,
    totalSales: Number(salesAgg._sum.totalAmount ?? 0),
    salesCount: salesAgg._count,
    invoiceCount,
  };
}
