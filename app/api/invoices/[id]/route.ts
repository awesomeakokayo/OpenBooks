import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { requireBusinessMember } from "@/lib/security/tenant";
import { logAuditEvent } from "@/lib/audit/logger";
import { canTransition } from "@/lib/invoices/service";
import type { InvoiceStatus } from "@prisma/client";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
  const invoice = await prisma.invoice.findFirst({
    where: { id, businessId },
    include: { customer: true, items: true, paymentMethods: true, payments: true, business: { include: { paymentSetting: true } } },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as unknown as { id: string }).id;
  const body = await req.json().catch(() => ({}));
  const { businessId, status, notes } = body;
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
  try {
    await requireBusinessMember(userId, businessId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.invoice.findFirst({ where: { id, businessId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: { status?: InvoiceStatus; notes?: string | null } = {};
  if (notes !== undefined) data.notes = typeof notes === "string" ? notes : null;

  if (status !== undefined) {
    const allowedStatuses = ["DRAFT", "SENT", "VIEWED", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"] as const;
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid invoice status" }, { status: 400 });
    }
    if (!canTransition(existing.status, status)) {
      return NextResponse.json({ error: `Cannot change invoice from ${existing.status} to ${status}` }, { status: 400 });
    }
    data.status = status;
  }

  const updated = await prisma.invoice.update({ where: { id }, data });

  if (status !== undefined) {
    await logAuditEvent({
      businessId,
      userId,
      action: "INVOICE_STATUS_CHANGED",
      entityType: "Invoice",
      entityId: id,
      metadata: { from: existing.status, to: status },
    });
  }

  return NextResponse.json(updated);
}
