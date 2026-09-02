import { prisma } from "@/lib/db/prisma";
import { roundMoney } from "@/lib/invoices/utils";
import { getNigeriaReportPeriods } from "./periods";
import { getNigeriaMonthRange, getCurrentNigeriaMonthKey } from "./months";

export async function getReports(businessId: string, selectedMonth = getCurrentNigeriaMonthKey()) {
  const { startOfDay, startOfWeek } = getNigeriaReportPeriods();
  const monthRange = getNigeriaMonthRange(selectedMonth);

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
    customers,
    invoiceOutstandingRecords,
  ] = await Promise.all([
    prisma.sale.aggregate({ where: { businessId, saleDate: { gte: startOfDay } }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({ where: { businessId, saleDate: { gte: startOfWeek } }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({ where: { businessId, saleDate: { gte: monthRange.start, lt: monthRange.end } }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({ where: { businessId }, _sum: { totalAmount: true } }),
    prisma.payment.aggregate({ where: { businessId, status: "SUCCESS", createdAt: { gte: startOfDay } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { businessId, status: "SUCCESS", createdAt: { gte: startOfWeek } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { businessId, status: "SUCCESS", createdAt: { gte: monthRange.start, lt: monthRange.end } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { businessId, status: "SUCCESS" }, _sum: { amount: true } }),
    prisma.payment.groupBy({
      by: ["method"],
      where: { businessId, status: "SUCCESS", createdAt: { gte: monthRange.start, lt: monthRange.end } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.expense.aggregate({ where: { businessId, expenseDate: { gte: monthRange.start, lt: monthRange.end } }, _sum: { amount: true } }),
    prisma.expense.groupBy({
      by: ["category"],
      where: { businessId, expenseDate: { gte: monthRange.start, lt: monthRange.end } },
      _sum: { amount: true },
    }),
    Promise.all([
      prisma.invoice.aggregate({ where: { businessId, status: { not: "CANCELLED" } }, _sum: { total: true } }),
      prisma.payment.aggregate({ where: { businessId, status: "SUCCESS", invoiceId: { not: null } }, _sum: { amount: true } }),
    ]),
    prisma.customer.findMany({ where: { businessId }, select: { id: true, name: true, phone: true } }),
    prisma.invoice.findMany({
      where: { businessId, status: { notIn: ["PAID", "CANCELLED"] } },
      select: {
        id: true,
        invoiceNumber: true,
        total: true,
        status: true,
        dueDate: true,
        customer: { select: { name: true } },
        payments: { where: { status: "SUCCESS" }, select: { amount: true } },
      },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  const totalInvoiced = roundMoney(Number(outstandingAgg[0]._sum.total ?? 0));
  const totalInvoicePaid = roundMoney(Number(outstandingAgg[1]._sum.amount ?? 0));
  const outstanding = Math.max(0, roundMoney(totalInvoiced - totalInvoicePaid));
  const totalExpenses = roundMoney(Number(expensesTotal._sum.amount ?? 0));

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

  const sales = {
    today: roundMoney(directSales.today + payments.today),
    week: roundMoney(directSales.week + payments.week),
    month: roundMoney(directSales.month + payments.month),
    total: roundMoney(directSales.total + payments.total),
  };

  const [invoiceTotalsByCustomer, paymentTotalsByCustomer] = await Promise.all([
    prisma.invoice.groupBy({
      by: ["customerId"],
      where: { businessId, status: { not: "CANCELLED" } },
      _sum: { total: true },
    }),
    prisma.payment.groupBy({
      by: ["customerId"],
      where: { businessId, status: "SUCCESS", invoiceId: { not: null } },
      _sum: { amount: true },
    }),
  ]);

  const invoiceTotals = new Map(invoiceTotalsByCustomer.map((row) => [row.customerId, Number(row._sum.total ?? 0)]));
  const paymentTotals = new Map(paymentTotalsByCustomer.map((row) => [row.customerId, Number(row._sum.amount ?? 0)]));

  const outstandingByCustomer = customers.map((customer) => {
    const totalCustomerInvoiced = roundMoney(invoiceTotals.get(customer.id) ?? 0);
    const totalCustomerPaid = roundMoney(paymentTotals.get(customer.id) ?? 0);
    return {
      ...customer,
      outstanding: Math.max(0, roundMoney(totalCustomerInvoiced - totalCustomerPaid)),
      totalInvoiced: totalCustomerInvoiced,
      totalPaid: totalCustomerPaid,
    };
  });

  const now = new Date();
  const outstandingByInvoice = invoiceOutstandingRecords.map((invoice) => {
    const total = roundMoney(Number(invoice.total));
    const paid = roundMoney(invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0));
    const amountOutstanding = Math.max(0, roundMoney(total - paid));
    const status = amountOutstanding === 0
      ? "PAID"
      : invoice.dueDate && invoice.dueDate < now
        ? "OVERDUE"
        : invoice.status;
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      total,
      amountPaid: paid,
      outstanding: amountOutstanding,
      status,
      dueDate: invoice.dueDate,
      customer: invoice.customer,
    };
  });

  const net = roundMoney(sales.month - totalExpenses);

  return {
    sales,
    paymentsByMethod: paymentsByMethod.map((g) => ({ method: g.method, amount: roundMoney(Number(g._sum.amount ?? 0)), count: g._count })),
    expenses: {
      total: totalExpenses,
      byCategory: expensesByCategory.map((g) => ({ category: g.category, amount: roundMoney(Number(g._sum.amount ?? 0)) })),
    },
    outstanding: {
      total: outstanding,
      byCustomer: outstandingByCustomer.filter((c) => c.outstanding > 0).sort((a, b) => b.outstanding - a.outstanding),
      byInvoice: outstandingByInvoice.filter((invoice) => invoice.outstanding > 0),
    },
    net,
    selectedMonth: monthRange.key,
  };
}
