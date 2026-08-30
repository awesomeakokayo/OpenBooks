import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { requireBusinessMember } from "@/lib/security/tenant";
import { calculateCustomerOutstanding } from "@/lib/customers/service";
import { customerSchema } from "@/lib/validation/schemas";

async function getAuthorizedContext(userId: string, businessId: string, customerId: string) {
  await requireBusinessMember(userId, businessId);
  const customer = await prisma.customer.findFirst({ where: { id: customerId, businessId } });
  if (!customer) throw new Error("Not found");
  return customer;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as unknown as { id: string }).id;
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
  try {
    const customer = await prisma.customer.findFirst({
      where: { id, businessId },
      include: {
        sales: { orderBy: { createdAt: "desc" }, take: 10 },
        invoices: { orderBy: { createdAt: "desc" }, take: 10 },
        payments: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
    await requireBusinessMember(userId, businessId);
    if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const stats = await calculateCustomerOutstanding(businessId, id);
    return NextResponse.json({ customer, stats });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as unknown as { id: string }).id;
  const body = await req.json().catch(() => ({}));
  const businessId = typeof body.businessId === "string" ? body.businessId : "";
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
  try {
    await getAuthorizedContext(userId, businessId, id);
    const parsed = customerSchema.safeParse({
      name: body.name,
      phone: body.phone,
      email: body.email,
      notes: body.notes,
    });
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid customer details" }, { status: 400 });

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        name: parsed.data.name.trim(),
        phone: parsed.data.phone.trim(),
        email: parsed.data.email?.trim() || null,
        notes: parsed.data.notes?.trim() || null,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error && error.message === "Not found" ? "Not found" : "Forbidden" }, { status: 403 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as unknown as { id: string }).id;
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
  try {
    await getAuthorizedContext(userId, businessId, id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [invoices, payments, sales] = await Promise.all([
    prisma.invoice.count({ where: { customerId: id, businessId } }),
    prisma.payment.count({ where: { customerId: id, businessId } }),
    prisma.sale.count({ where: { customerId: id, businessId } }),
  ]);
  if (invoices > 0 || payments > 0 || sales > 0) {
    return NextResponse.json({ error: "Cannot delete a customer with transaction history" }, { status: 400 });
  }

  await prisma.customer.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
