import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { requireBusinessMember } from "@/lib/security/tenant";
import { requireBusinessAdmin } from "@/lib/security/roles";
import { calculateCustomerOutstanding } from "@/lib/customers/service";
import { customerSchema } from "@/lib/validation/schemas";
import { userError } from "@/lib/security/error";

async function getAuthorizedContext(userId: string, businessId: string, customerId: string) {
  await requireBusinessMember(userId, businessId);
  const customer = await prisma.customer.findFirst({ where: { id: customerId, businessId } });
  if (!customer) throw new Error("NOT_FOUND");
  return customer;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return userError("Unauthorized", 401);
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return userError("businessId required", 400);
  try {
    await requireBusinessMember(userId, businessId);
    const customer = await prisma.customer.findFirst({ where: { id, businessId }, include: {
      sales: { orderBy: [{ saleDate: "desc" }, { id: "desc" }], take: 10 },
      invoices: { orderBy: [{ issueDate: "desc" }, { id: "desc" }], take: 10 },
      payments: { orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 10 },
    }});
    if (!customer) return userError("Not found", 404);
    const stats = await calculateCustomerOutstanding(businessId, id);
    return Response.json({ customer, stats });
  } catch (error) {
    if (error instanceof Error && error.message === "Not a member of this business") return userError("Forbidden", 403);
    return userError("Could not load customer", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return userError("Unauthorized", 401);
  const body = await req.json().catch(() => ({}));
  const businessId = typeof body.businessId === "string" ? body.businessId.trim() : "";
  if (!businessId) return userError("businessId required", 400);
  const parsed = customerSchema.safeParse({ name: body.name, phone: body.phone, email: body.email, notes: body.notes });
  if (!parsed.success) return userError(parsed.error.issues[0]?.message || "Invalid customer details", 400);
  try {
    await getAuthorizedContext(userId, businessId, id);
    const updated = await prisma.customer.update({ where: { id }, data: { name: parsed.data.name, phone: parsed.data.phone, email: parsed.data.email || null, notes: parsed.data.notes || null } });
    return Response.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") return userError("Not found", 404);
    if (error instanceof Error && error.message === "Not a member of this business") return userError("Forbidden", 403);
    return userError("Could not update customer", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return userError("Unauthorized", 401);
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return userError("businessId required", 400);
  try {
    await requireBusinessAdmin(userId, businessId);
    await getAuthorizedContext(userId, businessId, id);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") return userError("Not found", 404);
    return userError("Forbidden", 403);
  }
  const [invoices, payments, sales] = await Promise.all([
    prisma.invoice.count({ where: { customerId: id, businessId } }),
    prisma.payment.count({ where: { customerId: id, businessId } }),
    prisma.sale.count({ where: { customerId: id, businessId } }),
  ]);
  if (invoices > 0 || payments > 0 || sales > 0) return userError("Cannot delete a customer with transaction history", 400);
  await prisma.customer.delete({ where: { id } });
  return Response.json({ success: true });
}
