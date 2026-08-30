import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { requireBusinessMember } from "@/lib/security/tenant";
import { createInvoice } from "@/lib/invoices/service";
import { invoiceCreateSchema } from "@/lib/validation/schemas";
import { parseNigeriaDateInput } from "@/lib/dates/nigeria";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as unknown as { id: string }).id;
  const businessId = req.nextUrl.searchParams.get("businessId");
  const status = req.nextUrl.searchParams.get("status");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
  try {
    await requireBusinessMember(userId, businessId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const where: Record<string, unknown> = { businessId };
  if (status) where.status = status;
  const invoices = await prisma.invoice.findMany({
    where: where as never,
    include: { customer: true, items: true, paymentMethods: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as unknown as { id: string }).id;
  const body = await req.json().catch(() => ({}));
  const parsed = invoiceCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid invoice" }, { status: 400 });
  }
  const data = parsed.data;
  if (!data.businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
  try {
    await requireBusinessMember(userId, data.businessId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const dueDate = data.dueDate ? parseNigeriaDateInput(data.dueDate).toISOString() : null;
    const invoice = await createInvoice({
      businessId: data.businessId,
      userId,
      customerId: data.customerId,
      items: data.items,
      discount: data.discount,
      dueDate,
      notes: data.notes,
      paymentMethods: data.paymentMethods,
    });
    return NextResponse.json(invoice, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not create invoice";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
