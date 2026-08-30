import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { requireBusinessAdmin } from "@/lib/security/roles";
import { prisma } from "@/lib/db/prisma";
import { logAuditEvent } from "@/lib/audit/logger";
import { paymentSettingsSchema } from "@/lib/validation/schemas";
import { userError } from "@/lib/security/error";

function userIdFrom(session: { user?: unknown } | null) { return (session?.user as { id?: string } | undefined)?.id; }

export async function GET(req: NextRequest) {
  const userId = userIdFrom(await auth());
  if (!userId) return userError("Unauthorized", 401);
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return userError("businessId required", 400);
  try { await requireBusinessAdmin(userId, businessId); } catch (error) {
    return userError(error instanceof Error && error.message === "Insufficient permissions" ? error.message : "Forbidden", 403);
  }
  try { return Response.json(await prisma.businessPaymentSetting.findUnique({ where: { businessId } })); }
  catch { return userError("Could not load payment settings", 500); }
}

export async function PATCH(req: NextRequest) {
  const userId = userIdFrom(await auth());
  if (!userId) return userError("Unauthorized", 401);
  const body = await req.json().catch(() => ({}));
  const businessId = typeof body.businessId === "string" ? body.businessId.trim() : "";
  if (!businessId) return userError("businessId required", 400);
  try { await requireBusinessAdmin(userId, businessId); } catch (error) {
    return userError(error instanceof Error && error.message === "Insufficient permissions" ? error.message : "Forbidden", 403);
  }

  const parsed = paymentSettingsSchema.safeParse({
    bankTransferEnabled: body.bankTransferEnabled ?? true,
    cashEnabled: body.cashEnabled ?? true,
    posEnabled: body.posEnabled ?? false,
    bankName: body.bankName,
    accountName: body.accountName,
    accountNumber: body.accountNumber,
  });
  if (!parsed.success) return userError(parsed.error.issues[0]?.message || "Invalid payment settings", 400);

  try {
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
    await logAuditEvent({ businessId, userId, action: "BUSINESS_SETTINGS_CHANGED", entityType: "BusinessPaymentSetting", entityId: updated.id, metadata: { fields: ["bankTransferEnabled", "cashEnabled", "posEnabled", "bankName", "accountName", "accountNumber"] } });
    return Response.json(updated);
  } catch { return userError("Could not save payment settings", 500); }
}
