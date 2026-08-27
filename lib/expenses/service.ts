import { prisma } from "@/lib/db/prisma";
import { logAuditEvent } from "@/lib/audit/logger";
import type { ExpenseCategory } from "@prisma/client";

export async function recordExpense(params: {
  businessId: string;
  userId: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
  paymentMethod?: string;
  expenseDate?: Date;
}) {
  if (params.amount <= 0) throw new Error("Amount must be greater than 0");
  if (!params.category) throw new Error("Category required");

  const expense = await prisma.expense.create({
    data: {
      businessId: params.businessId,
      category: params.category,
      amount: params.amount,
      description: params.description?.trim() || null,
      paymentMethod: params.paymentMethod || null,
      expenseDate: params.expenseDate ?? new Date(),
    },
  });

  await logAuditEvent({
    businessId: params.businessId,
    userId: params.userId,
    action: "EXPENSE_RECORDED",
    entityType: "Expense",
    entityId: expense.id,
    metadata: { amount: params.amount, category: params.category },
  });

  return expense;
}

export async function listExpenses(businessId: string) {
  return prisma.expense.findMany({
    where: { businessId },
    orderBy: { expenseDate: "desc" },
    take: 50,
  });
}

export async function expenseSummary(businessId: string) {
  const [total, byCategory] = await Promise.all([
    prisma.expense.aggregate({ where: { businessId }, _sum: { amount: true } }),
    prisma.expense.groupBy({ by: ["category"], where: { businessId }, _sum: { amount: true }, _count: true }),
  ]);
  return {
    total: Number(total._sum.amount ?? 0),
    byCategory: byCategory.map((g) => ({
      category: g.category,
      amount: Number(g._sum.amount ?? 0),
      count: g._count,
    })),
  };
}
