import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createBusiness, getBusinessesForUser, updateBusiness } from "@/lib/business/service";
import { requireBusinessAdmin } from "@/lib/security/roles";
import { z } from "zod";

function sessionUserId(session: { user?: unknown } | null) {
  return (session?.user as { id?: string } | undefined)?.id;
}

const updateBusinessSchema = z.object({
  businessId: z.string().min(1),
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(8).max(20),
  email: z.string().trim().email().optional().or(z.literal("")),
  address: z.string().trim().max(200),
  description: z.string().trim().max(500),
});

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
    const body = await req.json().catch(() => ({}));
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

export async function PATCH(req: NextRequest) {
  const session = await auth();
  const userId = sessionUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = updateBusinessSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid business details" }, { status: 400 });
    }

    const { businessId, ...data } = parsed.data;
    await requireBusinessAdmin(userId, businessId);

    const business = await updateBusiness(businessId, userId, {
      ...data,
      email: data.email || "",
      address: data.address || "",
      description: data.description || "",
    });

    return NextResponse.json(business);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Could not update business";
    const status = message === "Insufficient permissions" || message === "Not a member of this business" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
