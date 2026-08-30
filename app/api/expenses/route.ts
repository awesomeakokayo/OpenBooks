import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { requireBusinessMember } from "@/lib/security/tenant";
import { recordExpense, listExpenses } from "@/lib/expenses/service";
import { expenseCreateSchema } from "@/lib/validation/schemas";
import { parseNigeriaDateInput } from "@/lib/dates/nigeria";
import { userError } from "@/lib/security/error";

function parsePage(value: string | null) { const n = Number(value ?? 1); return Number.isInteger(n) && n > 0 ? n : 1; }
function parseLimit(value: string | null) { const n = Number(value ?? 25); return Number.isInteger(n) && n > 0 && n <= 100 ? n : 25; }

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return userError("Unauthorized", 401);
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return userError("businessId required", 400);
  try {
    await requireBusinessMember(userId, businessId);
    return Response.json(await listExpenses(businessId, { page: parsePage(req.nextUrl.searchParams.get("page")), limit: parseLimit(req.nextUrl.searchParams.get("limit")) }));
  } catch { return userError("Could not load expenses", 500); }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return userError("Unauthorized", 401);
  const body = await req.json().catch(() => ({}));
  const parsed = expenseCreateSchema.safeParse(body);
  if (!parsed.success) return userError(parsed.error.issues[0]?.message || "Invalid expense", 400);
  try { await requireBusinessMember(userId, parsed.data.businessId); } catch { return userError("Forbidden", 403); }
  try {
    const expense = await recordExpense({ ...parsed.data, userId, expenseDate: parsed.data.expenseDate ? parseNigeriaDateInput(parsed.data.expenseDate) : undefined, paymentMethod: parsed.data.paymentMethod || undefined });
    return Response.json(expense, { status: 201 });
  } catch { return userError("Could not record expense", 400); }
}
