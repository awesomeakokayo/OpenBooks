import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { requireBusinessMember } from "@/lib/security/tenant";
import { recordSale, listSales } from "@/lib/sales/service";

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
  const sales = await listSales(businessId);
  return NextResponse.json(sales);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as unknown as { id: string }).id;
  const body = await req.json();
  const { businessId, customerId, description, quantity, unitPrice, discount, paymentMethod, saleDate, notes } = body;
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
  try {
    await requireBusinessMember(userId, businessId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const sale = await recordSale({
      businessId,
      userId,
      customerId: customerId || null,
      description,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      discount: discount ? Number(discount) : 0,
      paymentMethod,
      saleDate: saleDate ? new Date(saleDate) : undefined,
      notes,
    });
    return NextResponse.json(sale, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not record sale";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
