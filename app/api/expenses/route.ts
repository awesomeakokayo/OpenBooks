import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { requireBusinessMember } from "@/lib/security/tenant";
import { recordExpense, listExpenses } from "@/lib/expenses/service";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as unknown as { id: string }).id;
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
  try {
    await requireBusinessMember(userId, businessId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const expenses = await listExpenses(businessId);
  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as unknown as { id: string }).id;
  const body = await req.json();
  const { businessId, category, amount, description, paymentMethod, expenseDate } = body;
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
  try {
    await requireBusinessMember(userId, businessId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const expense = await recordExpense({
      businessId,
      userId,
      category,
      amount: Number(amount),
      description,
      paymentMethod,
      expenseDate: expenseDate ? new Date(expenseDate) : undefined,
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not record expense";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
