import { prisma } from "@/lib/db/prisma";
import { roundMoney } from "@/lib/invoices/utils";

export async function getDashboardMetrics(businessId: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    todayDirectSales,
    weekDirectSales,
    monthDirectSales,
    todayInvoicePayments,
    weekInvoicePayments,
    monthInvoicePayments,
    outstandingAgg,
    customerCount,
    recentSales,
    recentInvoicePayments,
  ] = await Promise.all([
    prisma.sale.aggregate({ where: { businessId, createdAt: { gte: startOfDay } }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({ where: { businessId, createdAt: { gte: startOfWeek } }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({ where: { businessId, createdAt: { gte: startOfMonth } }, _sum: { totalAmount: true } }),
    prisma.payment.aggregate({ where: { businessId, status: "SUCCESS", invoiceId: { not: null }, createdAt: { gte: startOfDay } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { businessId, status: "SUCCESS", invoiceId: { not: null }, createdAt: { gte: startOfWeek } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { businessId, status: "SUCCESS", invoiceId: { not: null }, createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
    Promise.all([
      prisma.invoice.aggregate({ where: { businessId, status: { not: "CANCELLED" } }, _sum: { total: true } }),
      prisma.payment.aggregate({ where: { businessId, status: "SUCCESS" }, _sum: { amount: true } }),
    ]),
    prisma.customer.count({ where: { businessId } }),
    prisma.sale.findMany({ where: { businessId }, include: { customer: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.payment.findMany({
      where: { businessId, status: "SUCCESS", invoiceId: { not: null } },
      include: { customer: true, invoice: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const totalInvoiced = roundMoney(Number(outstandingAgg[0]._sum.total ?? 0));
  const totalPaid = roundMoney(Number(outstandingAgg[1]._sum.amount ?? 0));
  const outstanding = Math.max(0, roundMoney(totalInvoiced - totalPaid));

  const directSales = {
    today: roundMoney(Number(todayDirectSales._sum.totalAmount ?? 0)),
    week: roundMoney(Number(weekDirectSales._sum.totalAmount ?? 0)),
    month: roundMoney(Number(monthDirectSales._sum.totalAmount ?? 0)),
  };

  const invoicePayments = {
    today: roundMoney(Number(todayInvoicePayments._sum.amount ?? 0)),
    week: roundMoney(Number(weekInvoicePayments._sum.amount ?? 0)),
    month: roundMoney(Number(monthInvoicePayments._sum.amount ?? 0)),
  };

  // Dashboard sales represent money received/recorded for the period. Direct
  // sales live in Sale; invoice payments live in Payment, so both are included.
  const combinedActivity = [
    ...recentSales.map((sale) => ({
      id: `sale:${sale.id}`,
      createdAt: sale.createdAt,
      description: sale.description,
      customerName: sale.customer?.name ?? "Walk-in customer",
      amount: Number(sale.totalAmount),
      method: sale.paymentMethod ?? null,
      type: "SALE" as const,
    })),
    ...recentInvoicePayments.map((payment) => ({
      id: `payment:${payment.id}`,
      createdAt: payment.createdAt,
      description: payment.invoice?.invoiceNumber ? `Payment for ${payment.invoice.invoiceNumber}` : "Invoice payment",
      customerName: payment.customer?.name ?? "Customer",
      amount: Number(payment.amount),
      method: payment.method,
      type: "PAYMENT" as const,
    })),
  ]
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .reverse()
    .slice(0, 8);

  return {
    todaySales: roundMoney(directSales.today + invoicePayments.today),
    weekSales: roundMoney(directSales.week + invoicePayments.week),
    monthSales: roundMoney(directSales.month + invoicePayments.month),
    outstanding,
    totalInvoiced,
    totalPaid,
    customerCount,
    recentSales: combinedActivity,
  };
}
