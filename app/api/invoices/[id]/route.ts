import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { requireBusinessAdmin } from "@/lib/security/roles";
import { requireBusinessMember } from "@/lib/security/tenant";
import { prisma } from "@/lib/db/prisma";
import { logAuditEvent } from "@/lib/audit/logger";
import { canTransition } from "@/lib/invoices/service";
import { userError } from "@/lib/security/error";
import { z } from "zod";
import type { InvoiceStatus } from "@prisma/client";

const invoiceUpdateSchema = z.object({
  businessId: z.string().min(1),
  status: z.enum(["DRAFT", "SENT", "VIEWED", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"]).optional(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return userError("Unauthorized", 401);
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return userError("businessId required", 400);
  try {
    await requireBusinessMember(userId, businessId);
    const invoice = await prisma.invoice.findFirst({ where: { id, businessId }, include: { customer: true, items: true, paymentMethods: true, payments: true, business: { include: { paymentSetting: true } } } });
    if (!invoice) return userError("Not found", 404);
    return Response.json(invoice);
  } catch { return userError("Could not load invoice", 500); }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return userError("Unauthorized", 401);
  const parsed = invoiceUpdateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return userError(parsed.error.issues[0]?.message || "Invalid invoice update", 400);
  const { businessId, status, notes } = parsed.data;
  try { await requireBusinessAdmin(userId, businessId); } catch (error) {
    return userError(error instanceof Error && error.message === "Insufficient permissions" ? error.message : "Forbidden", 403);
  }

  try {
    const existing = await prisma.invoice.findFirst({ where: { id, businessId } });
    if (!existing) return userError("Not found", 404);
    const data: { status?: InvoiceStatus; notes?: string | null } = {};
    if (notes !== undefined) data.notes = notes ?? null;
    if (status !== undefined) {
      if (!canTransition(existing.status, status)) return userError(`Cannot change invoice from ${existing.status} to ${status}`, 400);
      data.status = status;
    }
    const updated = await prisma.invoice.update({ where: { id }, data });
    if (status !== undefined) await logAuditEvent({ businessId, userId, action: "INVOICE_STATUS_CHANGED", entityType: "Invoice", entityId: id, metadata: { from: existing.status, to: status } });
    return Response.json(updated);
  } catch { return userError("Could not update invoice", 500); }
}
