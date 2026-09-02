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
    todayInvoices,
    weekInvoices,
    monthInvoices,
    totalInvoices,
    monthExpenses,
    outstandingAgg,
    customerCount,
    recentSales,
    recentPayments,
  ] = await Promise.all([
    // A direct sale contributes to sales when a payment method was recorded.
    prisma.sale.aggregate({ where: { businessId, paymentMethod: { not: null }, saleDate: { gte: startOfDay } }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({ where: { businessId, paymentMethod: { not: null }, saleDate: { gte: startOfWeek } }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({ where: { businessId, paymentMethod: { not: null }, saleDate: { gte: startOfMonth } }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({ where: { businessId, paymentMethod: { not: null } }, _sum: { totalAmount: true } }),
    // An invoice is a recorded sale. Its later payments settle the invoice
    // and therefore are not added again to sales (to avoid double counting).
    prisma.invoice.aggregate({ where: { businessId, status: { not: "CANCELLED" }, issueDate: { gte: startOfDay } }, _sum: { total: true } }),
    prisma.invoice.aggregate({ where: { businessId, status: { not: "CANCELLED" }, issueDate: { gte: startOfWeek } }, _sum: { total: true } }),
    prisma.invoice.aggregate({ where: { businessId, status: { not: "CANCELLED" }, issueDate: { gte: startOfMonth } }, _sum: { total: true } }),
    prisma.invoice.aggregate({ where: { businessId, status: { not: "CANCELLED" } }, _sum: { total: true } }),
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

  const invoices = {
    today: roundMoney(Number(todayInvoices._sum.total ?? 0)),
    week: roundMoney(Number(weekInvoices._sum.total ?? 0)),
    month: roundMoney(Number(monthInvoices._sum.total ?? 0)),
    total: roundMoney(Number(totalInvoices._sum.total ?? 0)),
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
    todaySales: roundMoney(directSales.today + invoices.today),
    weekSales: roundMoney(directSales.week + invoices.week),
    monthSales: roundMoney(directSales.month + invoices.month),
    totalSales: roundMoney(directSales.total + invoices.total),
    monthExpenses: roundMoney(Number(monthExpenses._sum.amount ?? 0)),
    outstanding,
    totalInvoiced,
    totalPaid: totalInvoicePaid,
    customerCount,
    recentSales: combinedActivity,
  };
}
