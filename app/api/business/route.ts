import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createBusiness, getBusinessesForUser } from "@/lib/business/service";

function sessionUserId(session: { user?: unknown } | null) {
  return (session?.user as { id?: string } | undefined)?.id;
}

export async function GET() {
  const session = await auth();
  const userId = sessionUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businesses = await getBusinessesForUser(userId);
  return NextResponse.json(businesses);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = sessionUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const business = await createBusiness({
      userId,
      name: body.name,
      phone: body.phone,
      email: body.email,
      address: body.address,
      description: body.description,
      logoUrl: body.logoUrl,
      paymentSettings: body.paymentSettings,
    });

    return NextResponse.json(business, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Could not create business";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
