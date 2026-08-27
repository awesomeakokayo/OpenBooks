import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { requireBusinessMember } from "@/lib/security/tenant";
import { recordManualPayment, listPayments } from "@/lib/payments/service";

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
  const body = await req.json();
  const { businessId, customerId, invoiceId, amount, method, reference, notes } = body;
  if (!businessId || !customerId) return NextResponse.json({ error: "businessId and customerId required" }, { status: 400 });
  try {
    await requireBusinessMember(userId, businessId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await recordManualPayment({
      businessId,
      userId,
      customerId,
      invoiceId: invoiceId || null,
      amount: Number(amount),
      method,
      reference,
      notes,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not record payment";
    const status = msg.includes("exceeds outstanding") || msg.includes("already paid") ? 400 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
