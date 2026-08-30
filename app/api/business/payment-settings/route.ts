import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { requireBusinessAdmin } from "@/lib/security/roles";
import { logAuditEvent } from "@/lib/audit/logger";
import { paymentSettingsSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  const userId = (session.user as unknown as { id?: string }).id;
  if (!userId) return NextResponse.json({ error: "No user id" }, { status: 400 });

  try {
    await requireBusinessAdmin(userId, businessId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return NextResponse.json({ error: message === "Insufficient permissions" ? message : "Forbidden" }, { status: 403 });
  }

  const setting = await prisma.businessPaymentSetting.findUnique({ where: { businessId } });
  return NextResponse.json(setting);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { businessId, ...data } = body;
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  const userId = (session.user as unknown as { id?: string }).id;
  if (!userId) return NextResponse.json({ error: "No user id" }, { status: 400 });

  try {
    await requireBusinessAdmin(userId, businessId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return NextResponse.json({ error: message === "Insufficient permissions" ? message : "Forbidden" }, { status: 403 });
  }

  const parsed = paymentSettingsSchema.safeParse({
    bankTransferEnabled: data.bankTransferEnabled ?? true,
    cashEnabled: data.cashEnabled ?? true,
    posEnabled: data.posEnabled ?? false,
    bankName: data.bankName,
    accountName: data.accountName,
    accountNumber: data.accountNumber,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payment settings" }, { status: 400 });
  }

  const updated = await prisma.businessPaymentSetting.upsert({
    where: { businessId },
    update: {
      bankTransferEnabled: parsed.data.bankTransferEnabled,
      cashEnabled: parsed.data.cashEnabled,
      posEnabled: parsed.data.posEnabled,
      paystackEnabled: false,
      bankName: parsed.data.bankName?.trim() || null,
      accountName: parsed.data.accountName?.trim() || null,
      accountNumber: parsed.data.accountNumber?.trim() || null,
    },
    create: {
      businessId,
      bankTransferEnabled: parsed.data.bankTransferEnabled,
      cashEnabled: parsed.data.cashEnabled,
      posEnabled: parsed.data.posEnabled,
      paystackEnabled: false,
      bankName: parsed.data.bankName?.trim() || null,
      accountName: parsed.data.accountName?.trim() || null,
      accountNumber: parsed.data.accountNumber?.trim() || null,
    },
  });

  await logAuditEvent({
    businessId,
    userId,
    action: "BUSINESS_SETTINGS_CHANGED",
    entityType: "BusinessPaymentSetting",
    entityId: updated.id,
    metadata: { fields: ["bankTransferEnabled", "cashEnabled", "posEnabled", "bankName", "accountName", "accountNumber"] },
  });

  return NextResponse.json(updated);
}
