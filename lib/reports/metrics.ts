import { prisma } from "@/lib/db/prisma";

export async function getDashboardMetrics(businessId: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todaySales, weekSales, monthSales, outstandingAgg, customerCount, recentSales] =
    await Promise.all([
      prisma.sale.aggregate({
        where: { businessId, createdAt: { gte: startOfDay } },
        _sum: { totalAmount: true },
      }),
      prisma.sale.aggregate({
        where: { businessId, createdAt: { gte: startOfWeek } },
        _sum: { totalAmount: true },
      }),
      prisma.sale.aggregate({
        where: { businessId, createdAt: { gte: startOfMonth } },
        _sum: { totalAmount: true },
      }),
      // Outstanding = invoices total - successful payments (derived)
      Promise.all([
        prisma.invoice.aggregate({
          where: { businessId, status: { not: "CANCELLED" } },
          _sum: { total: true },
        }),
        prisma.payment.aggregate({
          where: { businessId, status: "SUCCESS" },
          _sum: { amount: true },
        }),
      ]),
      prisma.customer.count({ where: { businessId } }),
      prisma.sale.findMany({
        where: { businessId },
        include: { customer: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const totalInvoiced = Number(outstandingAgg[0]._sum.total ?? 0);
  const totalPaid = Number(outstandingAgg[1]._sum.amount ?? 0);
  const outstanding = Math.max(0, totalInvoiced - totalPaid);

  return {
    todaySales: Number(todaySales._sum.totalAmount ?? 0),
    weekSales: Number(weekSales._sum.totalAmount ?? 0),
    monthSales: Number(monthSales._sum.totalAmount ?? 0),
    outstanding,
    totalInvoiced,
    totalPaid,
    customerCount,
    recentSales,
  };
}
