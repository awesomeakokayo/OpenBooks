import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { requireBusinessMember } from "@/lib/security/tenant";
import { createInvoice } from "@/lib/invoices/service";
import { invoiceCreateSchema } from "@/lib/validation/schemas";
import { parseNigeriaDateInput } from "@/lib/dates/nigeria";
import { userError } from "@/lib/security/error";

type InvoiceStatusValue = "DRAFT" | "SENT" | "VIEWED" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";
function parsePage(value: string | null) { const n = Number(value ?? 1); return Number.isInteger(n) && n > 0 ? n : 1; }
function parseLimit(value: string | null) { const n = Number(value ?? 25); return Number.isInteger(n) && n > 0 && n <= 100 ? n : 25; }

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return userError("Unauthorized", 401);
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return userError("businessId required", 400);
  const statusParam = req.nextUrl.searchParams.get("status");
  if (statusParam && !["DRAFT","SENT","VIEWED","PARTIALLY_PAID","PAID","OVERDUE","CANCELLED"].includes(statusParam)) return userError("Invalid invoice status", 400);
  try {
    await requireBusinessMember(userId, businessId);
    const page = parsePage(req.nextUrl.searchParams.get("page"));
    const limit = parseLimit(req.nextUrl.searchParams.get("limit"));
    const where = { businessId, ...(statusParam ? { status: statusParam as InvoiceStatusValue } : {}) };
    const [items, total] = await Promise.all([
      prisma.invoice.findMany({ where, include: { customer: true, items: true, paymentMethods: true }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * limit, take: limit }),
      prisma.invoice.count({ where }),
    ]);
    return Response.json({ items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch { return userError("Could not load invoices", 500); }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return userError("Unauthorized", 401);
  const body = await req.json().catch(() => ({}));
  const parsed = invoiceCreateSchema.safeParse(body);
  if (!parsed.success) return userError(parsed.error.issues[0]?.message || "Invalid invoice", 400);
  try { await requireBusinessMember(userId, parsed.data.businessId); } catch { return userError("Forbidden", 403); }
  try {
    const invoice = await createInvoice({ ...parsed.data, userId, dueDate: parsed.data.dueDate ? parseNigeriaDateInput(parsed.data.dueDate).toISOString() : null });
    return Response.json(invoice, { status: 201 });
  } catch { return userError("Could not create invoice", 400); }
}
