import { prisma } from "@/lib/db/prisma";
import { roundMoney } from "@/lib/invoices/utils";

export async function getReports(businessId: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    todayDirectSales,
    weekDirectSales,
    monthDirectSales,
    totalDirectSales,
    todayPayments,
    weekPayments,
    monthPayments,
    totalPayments,
    paymentsByMethod,
    expensesTotal,
    expensesByCategory,
    outstandingAgg,
  ] = await Promise.all([
    prisma.sale.aggregate({ where: { businessId, createdAt: { gte: startOfDay } }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({ where: { businessId, createdAt: { gte: startOfWeek } }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({ where: { businessId, createdAt: { gte: startOfMonth } }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({ where: { businessId }, _sum: { totalAmount: true } }),
    prisma.payment.aggregate({ where: { businessId, status: "SUCCESS", createdAt: { gte: startOfDay } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { businessId, status: "SUCCESS", createdAt: { gte: startOfWeek } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { businessId, status: "SUCCESS", createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { businessId, status: "SUCCESS" }, _sum: { amount: true } }),
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
      prisma.payment.aggregate({ where: { businessId, status: "SUCCESS", invoiceId: { not: null } }, _sum: { amount: true } }),
    ]),
  ]);

  const totalInvoiced = Number(outstandingAgg[0]._sum.total ?? 0);
  const totalInvoicePaid = Number(outstandingAgg[1]._sum.amount ?? 0);
  const outstanding = Math.max(0, roundMoney(totalInvoiced - totalInvoicePaid));
  const totalExpenses = roundMoney(Number(expensesTotal._sum.amount ?? 0));

  const directSales = {
    today: Number(todayDirectSales._sum.totalAmount ?? 0),
    week: Number(weekDirectSales._sum.totalAmount ?? 0),
    month: Number(monthDirectSales._sum.totalAmount ?? 0),
    total: Number(totalDirectSales._sum.totalAmount ?? 0),
  };

  const payments = {
    today: Number(todayPayments._sum.amount ?? 0),
    week: Number(weekPayments._sum.amount ?? 0),
    month: Number(monthPayments._sum.amount ?? 0),
    total: Number(totalPayments._sum.amount ?? 0),
  };

  // Revenue/sales means money received or recorded. Invoice payments are
  // stored as Payment records, while standalone sales are stored as Sale
  // records. Reports must combine both sources using the same definition as
  // the dashboard so payment activity is reflected immediately.
  const sales = {
    today: roundMoney(directSales.today + payments.today),
    week: roundMoney(directSales.week + payments.week),
    month: roundMoney(directSales.month + payments.month),
    total: roundMoney(directSales.total + payments.total),
  };

  const customers = await prisma.customer.findMany({
    where: { businessId },
    select: { id: true, name: true, phone: true },
  });
  const outstandingByCustomer = await Promise.all(
    customers.map(async (c) => {
      const [invAgg, payAgg] = await Promise.all([
        prisma.invoice.aggregate({ where: { businessId, customerId: c.id, status: { not: "CANCELLED" } }, _sum: { total: true } }),
        prisma.payment.aggregate({ where: { businessId, customerId: c.id, status: "SUCCESS", invoiceId: { not: null } }, _sum: { amount: true } }),
      ]);
      const inv = Number(invAgg._sum.total ?? 0);
      const pay = Number(payAgg._sum.amount ?? 0);
      return { ...c, outstanding: Math.max(0, roundMoney(inv - pay)), totalInvoiced: inv, totalPaid: pay };
    })
  );

  const outstandingByInvoice = await prisma.invoice.findMany({
    where: { businessId, status: { notIn: ["PAID", "CANCELLED"] as never } },
    select: { id: true, invoiceNumber: true, total: true, status: true, dueDate: true, customer: { select: { name: true } } },
    orderBy: { dueDate: "asc" },
  });

  const totalReceived = sales.total;
  const net = roundMoney(totalReceived - totalExpenses);

  return {
    sales,
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
