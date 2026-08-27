import { prisma } from "@/lib/db/prisma";

export async function getReports(businessId: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [salesToday, salesWeek, salesMonth, paymentsByMethod, expensesTotal, expensesByCategory, outstandingAgg, expensesAgg, salesAgg] =
    await Promise.all([
      prisma.sale.aggregate({ where: { businessId, createdAt: { gte: startOfDay } }, _sum: { totalAmount: true } }),
      prisma.sale.aggregate({ where: { businessId, createdAt: { gte: startOfWeek } }, _sum: { totalAmount: true } }),
      prisma.sale.aggregate({ where: { businessId, createdAt: { gte: startOfMonth } }, _sum: { totalAmount: true } }),
      prisma.payment.groupBy({
        by: ["method"],
        where: { businessId, status: "SUCCESS" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.expense.aggregate({ where: { businessId }, _sum: { amount: true } }),
      prisma.expense.groupBy({ by: ["category"], where: { businessId }, _sum: { amount: true } }),
      Promise.all([
        prisma.invoice.aggregate({ where: { businessId, status: { not: "CANCELLED" } }, _sum: { total: true } }),
        prisma.payment.aggregate({ where: { businessId, status: "SUCCESS" }, _sum: { amount: true } }),
      ]),
      prisma.expense.aggregate({ where: { businessId }, _sum: { amount: true } }),
      prisma.sale.aggregate({ where: { businessId }, _sum: { totalAmount: true } }),
    ]);

  const totalInvoiced = Number(outstandingAgg[0]._sum.total ?? 0);
  const totalPaid = Number(outstandingAgg[1]._sum.amount ?? 0);
  const outstanding = Math.max(0, totalInvoiced - totalPaid);
  const totalExpenses = Number(expensesTotal._sum.amount ?? 0);
  const totalSales = Number(salesAgg._sum.totalAmount ?? 0);
  const net = totalSales - totalExpenses;

  // Outstanding by customer
  const customers = await prisma.customer.findMany({
    where: { businessId },
    select: { id: true, name: true, phone: true },
  });
  const outstandingByCustomer = await Promise.all(
    customers.map(async (c) => {
      const [invAgg, payAgg] = await Promise.all([
        prisma.invoice.aggregate({ where: { businessId, customerId: c.id, status: { not: "CANCELLED" } }, _sum: { total: true } }),
        prisma.payment.aggregate({ where: { businessId, customerId: c.id, status: "SUCCESS" }, _sum: { amount: true } }),
      ]);
      const inv = Number(invAgg._sum.total ?? 0);
      const pay = Number(payAgg._sum.amount ?? 0);
      return { ...c, outstanding: Math.max(0, inv - pay), totalInvoiced: inv, totalPaid: pay };
    })
  );

  // Outstanding by invoice
  const outstandingByInvoice = await prisma.invoice.findMany({
    where: { businessId, status: { notIn: ["PAID", "CANCELLED"] as never } },
    select: { id: true, invoiceNumber: true, total: true, status: true, dueDate: true, customer: { select: { name: true } } },
    orderBy: { dueDate: "asc" },
  });

  return {
    sales: {
      today: Number(salesToday._sum.totalAmount ?? 0),
      week: Number(salesWeek._sum.totalAmount ?? 0),
      month: Number(salesMonth._sum.totalAmount ?? 0),
      total: totalSales,
    },
    paymentsByMethod: paymentsByMethod.map((g) => ({ method: g.method, amount: Number(g._sum.amount ?? 0), count: g._count })),
    expenses: {
      total: totalExpenses,
      byCategory: expensesByCategory.map((g) => ({ category: g.category, amount: Number(g._sum.amount ?? 0) })),
    },
    outstanding: {
      total: outstanding,
      byCustomer: outstandingByCustomer.filter((c) => c.outstanding > 0).sort((a, b) => b.outstanding - a.outstanding),
      byInvoice: outstandingByInvoice,
    },
    net,
  };
}
