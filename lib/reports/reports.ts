import { prisma } from "@/lib/db/prisma";
import { roundMoney } from "@/lib/invoices/utils";
import { getNigeriaReportPeriods } from "./periods";

export async function getReports(businessId: string) {
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
    paymentsByMethod,
    expensesTotal,
    expensesByCategory,
    outstandingAgg,
    customers,
    invoiceOutstandingRecords,
  ] = await Promise.all([
    // Direct sales are treated as sales when a payment method is recorded.
    prisma.sale.aggregate({ where: { businessId, paymentMethod: { not: null }, saleDate: { gte: startOfDay } }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({ where: { businessId, paymentMethod: { not: null }, saleDate: { gte: startOfWeek } }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({ where: { businessId, paymentMethod: { not: null }, saleDate: { gte: startOfMonth } }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({ where: { businessId, paymentMethod: { not: null } }, _sum: { totalAmount: true } }),
    // Invoices are recorded sales. Payments against an invoice settle an
    // existing sale and must not be added to sales a second time.
    prisma.invoice.aggregate({ where: { businessId, status: { not: "CANCELLED" }, issueDate: { gte: startOfDay } }, _sum: { total: true } }),
    prisma.invoice.aggregate({ where: { businessId, status: { not: "CANCELLED" }, issueDate: { gte: startOfWeek } }, _sum: { total: true } }),
    prisma.invoice.aggregate({ where: { businessId, status: { not: "CANCELLED" }, issueDate: { gte: startOfMonth } }, _sum: { total: true } }),
    prisma.invoice.aggregate({ where: { businessId, status: { not: "CANCELLED" } }, _sum: { total: true } }),
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

  const invoices = {
    today: roundMoney(Number(todayInvoices._sum.total ?? 0)),
    week: roundMoney(Number(weekInvoices._sum.total ?? 0)),
    month: roundMoney(Number(monthInvoices._sum.total ?? 0)),
    total: roundMoney(Number(totalInvoices._sum.total ?? 0)),
  };

  const sales = {
    today: roundMoney(directSales.today + invoices.today),
    week: roundMoney(directSales.week + invoices.week),
    month: roundMoney(directSales.month + invoices.month),
    total: roundMoney(directSales.total + invoices.total),
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

  const net = roundMoney(sales.total - totalExpenses);

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
  };
}
