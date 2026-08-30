import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { requireBusinessMember } from "@/lib/security/tenant";
import { recordManualPayment, listPayments } from "@/lib/payments/service";
import { paymentCreateSchema } from "@/lib/validation/schemas";
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
    return Response.json(await listPayments(businessId, { page: parsePage(req.nextUrl.searchParams.get("page")), limit: parseLimit(req.nextUrl.searchParams.get("limit")) }));
  } catch { return userError("Could not load payments", 500); }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return userError("Unauthorized", 401);
  const body = await req.json().catch(() => ({}));
  const parsed = paymentCreateSchema.safeParse(body);
  if (!parsed.success) return userError(parsed.error.issues[0]?.message || "Invalid payment", 400);
  try { await requireBusinessMember(userId, parsed.data.businessId); } catch { return userError("Forbidden", 403); }
  try {
    const result = await recordManualPayment({ ...parsed.data, userId, invoiceId: parsed.data.invoiceId || null });
    return Response.json(result, { status: 201 });
  } catch { return userError("Could not record payment", 400); }
}
