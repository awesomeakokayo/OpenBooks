import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { requireBusinessMember } from "@/lib/security/tenant";
import { logAuditEvent } from "@/lib/audit/logger";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
  const userId = (session.user as unknown as { id: string }).id;
  try {
    await requireBusinessMember(userId, businessId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const setting = await prisma.businessPaymentSetting.findUnique({ where: { businessId } });
  return NextResponse.json(setting);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { businessId, ...data } = body;
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
  const userId = (session.user as unknown as { id: string }).id;
  try {
    await requireBusinessMember(userId, businessId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.businessPaymentSetting.upsert({
    where: { businessId },
    update: {
      bankTransferEnabled: data.bankTransferEnabled,
      cashEnabled: data.cashEnabled,
      posEnabled: data.posEnabled,
      paystackEnabled: data.paystackEnabled,
      bankName: data.bankName,
      accountName: data.accountName,
      accountNumber: data.accountNumber,
    },
    create: {
      businessId,
      bankTransferEnabled: data.bankTransferEnabled ?? true,
      cashEnabled: data.cashEnabled ?? true,
      posEnabled: data.posEnabled ?? false,
      paystackEnabled: data.paystackEnabled ?? false,
      bankName: data.bankName,
      accountName: data.accountName,
      accountNumber: data.accountNumber,
    },
  });

  await logAuditEvent({
    businessId,
    userId,
    action: "BUSINESS_SETTINGS_CHANGED",
    entityType: "BusinessPaymentSetting",
    entityId: updated.id,
    metadata: { fields: Object.keys(data) },
  });

  return NextResponse.json(updated);
}
