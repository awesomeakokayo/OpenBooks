import { prisma } from "@/lib/db/prisma";
import { logAuditEvent } from "@/lib/audit/logger";
import { roundMoney } from "@/lib/invoices/utils";
import type { ExpenseCategory, PaymentMethod } from "@prisma/client";

const V1_METHODS: PaymentMethod[] = ["CASH", "BANK_TRANSFER", "POS"];

export async function recordExpense(params: {
  businessId: string;
  userId: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
  paymentMethod?: PaymentMethod | null;
  expenseDate?: Date;
}) {
  const amount = roundMoney(params.amount);
  if (amount <= 0) throw new Error("Amount must be greater than 0");
  if (!params.category) throw new Error("Category required");
  if (params.paymentMethod && !V1_METHODS.includes(params.paymentMethod)) throw new Error("Payment method is not supported in OpenBooks V1");

  if (params.paymentMethod) {
    const setting = await prisma.businessPaymentSetting.findUnique({ where: { businessId: params.businessId } });
    if (!setting) throw new Error("Payment settings are not configured for this business");
    const enabled = (params.paymentMethod === "CASH" && setting.cashEnabled)
      || (params.paymentMethod === "BANK_TRANSFER" && setting.bankTransferEnabled)
      || (params.paymentMethod === "POS" && setting.posEnabled);
    if (!enabled) throw new Error("This payment method is not enabled for the business");
  }

  const expense = await prisma.expense.create({
    data: {
      businessId: params.businessId,
      category: params.category,
      amount,
      description: params.description?.trim() || null,
      paymentMethod: params.paymentMethod || null,
      expenseDate: params.expenseDate ?? new Date(),
    },
  });

  await logAuditEvent({ businessId: params.businessId, userId: params.userId, action: "EXPENSE_RECORDED", entityType: "Expense", entityId: expense.id, metadata: { amount, category: params.category } });
  return expense;
}

export async function listExpenses(businessId: string, options: { page?: number; limit?: number } = {}) {
  const page = Number.isInteger(options.page) && (options.page ?? 1) > 0 ? options.page! : 1;
  const limit = Number.isInteger(options.limit) && (options.limit ?? 25) > 0 && (options.limit ?? 25) <= 100 ? options.limit! : 25;
  const where = { businessId };
  const [items, total] = await Promise.all([
    prisma.expense.findMany({ where, orderBy: [{ expenseDate: "desc" }, { id: "desc" }], skip: (page - 1) * limit, take: limit }),
    prisma.expense.count({ where }),
  ]);
  return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function expenseSummary(businessId: string) {
  const [total, byCategory] = await Promise.all([
    prisma.expense.aggregate({ where: { businessId }, _sum: { amount: true } }),
    prisma.expense.groupBy({ by: ["category"], where: { businessId }, _sum: { amount: true }, _count: true }),
  ]);
  return { total: roundMoney(Number(total._sum.amount ?? 0)), byCategory: byCategory.map((g) => ({ category: g.category, amount: roundMoney(Number(g._sum.amount ?? 0)), count: g._count })) };
}
