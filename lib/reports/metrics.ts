import { prisma } from "@/lib/db/prisma";
import { roundMoney } from "@/lib/invoices/utils";
import { getNigeriaReportPeriods } from "./periods";
import { getNigeriaMonthRange, getCurrentNigeriaMonthKey } from "./months";

export async function getDashboardMetrics(businessId: string, selectedMonth = getCurrentNigeriaMonthKey()) {
  const { startOfDay, startOfWeek } = getNigeriaReportPeriods();
  const monthRange = getNigeriaMonthRange(selectedMonth);
  const currentMonth = getCurrentNigeriaMonthKey();
  const isCurrentMonth = monthRange.key === currentMonth;

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
    monthInvoices,
    recentSales,
    recentPayments,
  ] = await Promise.all([
    prisma.sale.aggregate({ where: { businessId, saleDate: { gte: startOfDay } }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({ where: { businessId, saleDate: { gte: startOfWeek } }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({ where: { businessId, saleDate: { gte: monthRange.start, lt: monthRange.end } }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({ where: { businessId }, _sum: { totalAmount: true } }),
    prisma.payment.aggregate({ where: { businessId, status: "SUCCESS", createdAt: { gte: startOfDay } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { businessId, status: "SUCCESS", createdAt: { gte: startOfWeek } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { businessId, status: "SUCCESS", createdAt: { gte: monthRange.start, lt: monthRange.end } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { businessId, status: "SUCCESS" }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { businessId, expenseDate: { gte: monthRange.start, lt: monthRange.end } }, _sum: { amount: true } }),
    Promise.all([
      prisma.invoice.aggregate({ where: { businessId, status: { not: "CANCELLED" } }, _sum: { total: true } }),
      prisma.payment.aggregate({ where: { businessId, status: "SUCCESS", invoiceId: { not: null } }, _sum: { amount: true } }),
    ]),
    prisma.customer.count({ where: { businessId } }),
    prisma.invoice.count({ where: { businessId, issueDate: { gte: monthRange.start, lt: monthRange.end } } }),
    prisma.sale.findMany({
      where: { businessId, saleDate: { gte: monthRange.start, lt: monthRange.end } },
      include: { customer: true },
      orderBy: { saleDate: "desc" },
      take: 8,
    }),
    prisma.payment.findMany({
      where: { businessId, status: "SUCCESS", createdAt: { gte: monthRange.start, lt: monthRange.end } },
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
      createdAt: sale.saleDate,
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
    todaySales: roundMoney(directSales.today + payments.today),
    weekSales: roundMoney(directSales.week + payments.week),
    monthSales: roundMoney(directSales.month + payments.month),
    totalSales: roundMoney(directSales.total + payments.total),
    monthExpenses: roundMoney(Number(monthExpenses._sum.amount ?? 0)),
    outstanding,
    totalInvoiced,
    totalPaid: totalInvoicePaid,
    customerCount,
    invoiceCount: monthInvoices,
    recentSales: combinedActivity,
    selectedMonth: monthRange.key,
    isCurrentMonth,
  };
}
