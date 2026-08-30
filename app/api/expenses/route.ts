import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { requireBusinessMember } from "@/lib/security/tenant";
import { recordExpense, listExpenses } from "@/lib/expenses/service";
import { expenseCreateSchema } from "@/lib/validation/schemas";
import { parseNigeriaDateInput } from "@/lib/dates/nigeria";

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
  const body = await req.json().catch(() => ({}));
  const parsed = expenseCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid expense" }, { status: 400 });
  }
  const data = parsed.data;
  try {
    await requireBusinessMember(userId, data.businessId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const expenseDate = data.expenseDate ? parseNigeriaDateInput(data.expenseDate) : undefined;
    const expense = await recordExpense({
      businessId: data.businessId,
      userId,
      category: data.category,
      amount: data.amount,
      description: data.description,
      paymentMethod: data.paymentMethod || undefined,
      expenseDate,
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not record expense";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
