import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { requireBusinessMember } from "@/lib/security/tenant";
import { recordSale, listSales } from "@/lib/sales/service";
import { saleCreateSchema } from "@/lib/validation/schemas";
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
  const sales = await listSales(businessId);
  return NextResponse.json(sales);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as unknown as { id: string }).id;
  const body = await req.json().catch(() => ({}));
  const parsed = saleCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid sale" }, { status: 400 });
  }
  const data = parsed.data;
  try {
    await requireBusinessMember(userId, data.businessId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const saleDate = data.saleDate ? parseNigeriaDateInput(data.saleDate) : undefined;
    const sale = await recordSale({
      businessId: data.businessId,
      userId,
      customerId: data.customerId || null,
      description: data.description,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      discount: data.discount,
      paymentMethod: data.paymentMethod || undefined,
      saleDate,
      notes: data.notes,
    });
    return NextResponse.json(sale, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not record sale";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
