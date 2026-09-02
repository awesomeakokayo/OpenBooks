import { prisma } from "@/lib/db/prisma";
import { roundMoney } from "@/lib/invoices/utils";
import { getNigeriaReportPeriods } from "./periods";

export async function getDashboardMetrics(businessId: string) {
  const { startOfDay, startOfWeek, startOfMonth } = getNigeriaReportPeriods();

  const [
    todayDirectSales,
    weekDirectSales,
    monthDirectSales,
    totalDirectSales,
    todayPayments,
    weekPayments,
    monthPayments,
    totalPayments,
    monthExpenses,
    outstandingAgg,
    customerCount,
    recentSales,
    recentPayments,
  ] = await Promise.all([
    // Direct sales contribute to sales when a payment method was recorded.
    prisma.sale.aggregate({ where: { businessId, paymentMethod: { not: null }, saleDate: { gte: startOfDay } }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({ where: { businessId, paymentMethod: { not: null }, saleDate: { gte: startOfWeek } }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({ where: { businessId, paymentMethod: { not: null }, saleDate: { gte: startOfMonth } }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({ where: { businessId, paymentMethod: { not: null } }, _sum: { totalAmount: true } }),
    // Successful payments contribute when the money was actually received.
    prisma.payment.aggregate({ where: { businessId, status: "SUCCESS", createdAt: { gte: startOfDay } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { businessId, status: "SUCCESS", createdAt: { gte: startOfWeek } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { businessId, status: "SUCCESS", createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { businessId, status: "SUCCESS" }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { businessId, expenseDate: { gte: startOfMonth } }, _sum: { amount: true } }),
    Promise.all([
      prisma.invoice.aggregate({ where: { businessId, status: { not: "CANCELLED" } }, _sum: { total: true } }),
      prisma.payment.aggregate({ where: { businessId, status: "SUCCESS", invoiceId: { not: null } }, _sum: { amount: true } }),
    ]),
    prisma.customer.count({ where: { businessId } }),
    prisma.sale.findMany({ where: { businessId }, include: { customer: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.payment.findMany({
      where: { businessId, status: "SUCCESS" },
      include: { customer: true, invoice: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const totalInvoiced = roundMoney(Number(outstandingAgg[0]._sum.total ?? 0));
  const totalInvoicePaid = roundMoney(Number(outstandingAgg[1]._sum.amount ?? 0));
  const outstanding = Math.max(0, roundMoney(totalInvoiced - totalInvoicePaid));

  const directSales = {
    today: roundMoney(Number(todayDirectSales._sum.totalAmount ?? 0)),
    week: roundMoney(Number(weekDirectSales._sum.totalAmount ?? 0)),
    month: roundMoney(Number(monthDirectSales._sum.totalAmount ?? 0)),
    total: roundMoney(Number(totalDirectSales._sum.totalAmount ?? 0)),
  };

  const payments = {
    today: roundMoney(Number(todayPayments._sum.amount ?? 0)),
    week: roundMoney(Number(weekPayments._sum.amount ?? 0)),
    month: roundMoney(Number(monthPayments._sum.amount ?? 0)),
    total: roundMoney(Number(totalPayments._sum.amount ?? 0)),
  };

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
    ...recentPayments.map((payment) => ({
      id: `payment:${payment.id}`,
      createdAt: payment.createdAt,
      description: payment.invoice?.invoiceNumber ? `Payment for ${payment.invoice.invoiceNumber}` : "Payment received",
      customerName: payment.customer?.name ?? "Customer",
      amount: Number(payment.amount),
      method: payment.method,
      type: "PAYMENT" as const,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);

  return {
    // Dashboard sales follows the same financial-event model as Recent Activity:
    // recorded direct sales + successful payments received. Invoice totals are
    // intentionally not added separately because they are not an activity event
    // and doing so can double-count invoice payments.
    todaySales: roundMoney(directSales.today + payments.today),
    weekSales: roundMoney(directSales.week + payments.week),
    monthSales: roundMoney(directSales.month + payments.month),
    totalSales: roundMoney(directSales.total + payments.total),
    monthExpenses: roundMoney(Number(monthExpenses._sum.amount ?? 0)),
    outstanding,
    totalInvoiced,
    totalPaid: totalInvoicePaid,
    customerCount,
    recentSales: combinedActivity,
  };
}
