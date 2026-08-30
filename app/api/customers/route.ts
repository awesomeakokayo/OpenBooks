import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { requireBusinessMember } from "@/lib/security/tenant";
import { createCustomer, listCustomers } from "@/lib/customers/service";
import { customerSchema } from "@/lib/validation/schemas";
import { userError } from "@/lib/security/error";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return userError("Unauthorized", 401);

  const businessId = req.nextUrl.searchParams.get("businessId");
  const search = req.nextUrl.searchParams.get("search") || undefined;
  const page = Number(req.nextUrl.searchParams.get("page") || 1);
  const limit = Number(req.nextUrl.searchParams.get("limit") || 25);
  if (!businessId) return userError("businessId required", 400);

  try {
    await requireBusinessMember(userId, businessId);
    const customers = await listCustomers(businessId, search, { page, limit });
    return Response.json(customers);
  } catch {
    return userError("Could not load customers", 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return userError("Unauthorized", 401);

  const body = await req.json().catch(() => ({}));
  const businessId = typeof body.businessId === "string" ? body.businessId.trim() : "";
  if (!businessId) return userError("businessId required", 400);

  const parsed = customerSchema.safeParse(body);
  if (!parsed.success) return userError(parsed.error.issues[0]?.message || "Invalid customer details", 400);

  try {
    await requireBusinessMember(userId, businessId);
    const customer = await createCustomer({
      businessId,
      userId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      notes: parsed.data.notes,
    });
    return Response.json(customer, { status: 201 });
  } catch {
    return userError("Could not create customer", 400);
  }
}
