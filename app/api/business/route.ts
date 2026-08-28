import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createBusiness, getBusinessesForUser } from "@/lib/business/service";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as unknown as { id?: string }).id;
  if (!userId) return NextResponse.json({ error: "No user id" }, { status: 400 });
  return NextResponse.json(await getBusinessesForUser(userId));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as unknown as { id?: string }).id;
  if (!userId) return NextResponse.json({ error: "No user id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));

  try {
    const business = await createBusiness({
      userId,
      name: body.name,
      phone: body.phone,
      email: body.email,
      address: body.address,
      description: body.description,
      logoUrl: body.logoUrl,
      paymentSettings: {
        bankTransferEnabled: body.paymentSettings?.bankTransferEnabled,
        cashEnabled: body.paymentSettings?.cashEnabled,
        posEnabled: body.paymentSettings?.posEnabled,
        bankName: body.paymentSettings?.bankName,
        accountName: body.paymentSettings?.accountName,
        accountNumber: body.paymentSettings?.accountNumber,
      },
    });
    return NextResponse.json(business, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Could not create business";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
