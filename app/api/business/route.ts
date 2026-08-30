import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { createBusiness, getBusinessesForUser, updateBusiness } from "@/lib/business/service";
import { requireBusinessAdmin } from "@/lib/security/roles";
import { businessSchema } from "@/lib/validation/schemas";
import { userError } from "@/lib/security/error";

function sessionUserId(session: { user?: unknown } | null) {
  return (session?.user as { id?: string } | undefined)?.id;
}

export async function GET() {
  const session = await auth();
  const userId = sessionUserId(session);
  if (!userId) return userError("Unauthorized", 401);
  try { return Response.json(await getBusinessesForUser(userId)); } catch { return userError("Could not load businesses", 500); }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = sessionUserId(session);
  if (!userId) return userError("Unauthorized", 401);
  const body = await req.json().catch(() => ({}));
  const parsed = businessSchema.safeParse(body);
  if (!parsed.success) return userError(parsed.error.issues[0]?.message || "Invalid business details", 400);
  try {
    const business = await createBusiness({ userId, ...parsed.data, email: parsed.data.email || undefined, address: parsed.data.address || undefined, description: parsed.data.description || undefined, paymentSettings: body.paymentSettings });
    return Response.json(business, { status: 201 });
  } catch { return userError("Could not create business", 400); }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  const userId = sessionUserId(session);
  if (!userId) return userError("Unauthorized", 401);
  const body = await req.json().catch(() => ({}));
  if (typeof body.businessId !== "string" || !body.businessId.trim()) return userError("businessId required", 400);
  const parsed = businessSchema.safeParse(body);
  if (!parsed.success) return userError(parsed.error.issues[0]?.message || "Invalid business details", 400);
  try {
    await requireBusinessAdmin(userId, body.businessId);
    const business = await updateBusiness(body.businessId, userId, { ...parsed.data, email: parsed.data.email || "", address: parsed.data.address || "", description: parsed.data.description || "" });
    return Response.json(business);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update business";
    if (message === "Insufficient permissions") return userError(message, 403);
    if (message === "Not a member of this business") return userError("Forbidden", 403);
    return userError("Could not update business", 400);
  }
}
