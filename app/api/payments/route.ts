import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { requireBusinessMember } from "@/lib/security/tenant";
import { recordManualPayment, listPayments } from "@/lib/payments/service";
import { paymentCreateSchema } from "@/lib/validation/schemas";

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
  const payments = await listPayments(businessId);
  return NextResponse.json(payments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as unknown as { id: string }).id;
  const body = await req.json().catch(() => ({}));
  const parsed = paymentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payment" }, { status: 400 });
  }
  const data = parsed.data;
  try {
    await requireBusinessMember(userId, data.businessId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await recordManualPayment({
      businessId: data.businessId,
      userId,
      customerId: data.customerId,
      invoiceId: data.invoiceId || null,
      amount: data.amount,
      method: data.method,
      reference: data.reference,
      notes: data.notes,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not record payment";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
