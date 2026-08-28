import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import { businessSchema, paymentSettingsSchema } from "@/lib/validation/schemas";
import { logAuditEvent } from "@/lib/audit/logger";

export async function createBusiness(params: {
  userId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  logoUrl?: string;
  description?: string;
  paymentSettings?: {
    bankTransferEnabled?: boolean;
    cashEnabled?: boolean;
    posEnabled?: boolean;
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
  };
}) {
  const parsedBusiness = businessSchema.safeParse({
    name: params.name,
    phone: params.phone,
    email: params.email,
    address: params.address,
    description: params.description,
  });
  if (!parsedBusiness.success) throw new Error(parsedBusiness.error.issues[0]?.message || "Invalid business details");

  const paymentSettings = {
    bankTransferEnabled: params.paymentSettings?.bankTransferEnabled ?? true,
    cashEnabled: params.paymentSettings?.cashEnabled ?? true,
    posEnabled: params.paymentSettings?.posEnabled ?? false,
    bankName: params.paymentSettings?.bankName,
    accountName: params.paymentSettings?.accountName,
    accountNumber: params.paymentSettings?.accountNumber,
  };

  const parsedPayments = paymentSettingsSchema.safeParse(paymentSettings);
  if (!parsedPayments.success) throw new Error(parsedPayments.error.issues[0]?.message || "Invalid payment settings");

  const business = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const b = await tx.business.create({
      data: {
        ownerId: params.userId,
        name: params.name.trim(),
        phone: params.phone.trim(),
        email: params.email?.trim() || null,
        address: params.address?.trim() || null,
        logoUrl: params.logoUrl || null,
        description: params.description?.trim() || null,
        currency: "NGN",
      },
    });
    await tx.businessMember.create({
      data: { userId: params.userId, businessId: b.id, role: "OWNER" },
    });
    await tx.businessPaymentSetting.create({
      data: {
        businessId: b.id,
        bankTransferEnabled: paymentSettings.bankTransferEnabled,
        cashEnabled: paymentSettings.cashEnabled,
        posEnabled: paymentSettings.posEnabled,
        paystackEnabled: false,
        bankName: paymentSettings.bankName?.trim() || null,
        accountName: paymentSettings.accountName?.trim() || null,
        accountNumber: paymentSettings.accountNumber?.trim() || null,
      },
    });
    return b;
  });

  await logAuditEvent({
    businessId: business.id,
    userId: params.userId,
    action: "BUSINESS_CREATED",
    entityType: "Business",
    entityId: business.id,
  });

  return business;
}

export async function getBusinessesForUser(userId: string) {
  const members = await prisma.businessMember.findMany({
    where: { userId },
    include: { business: { include: { paymentSetting: true } } },
  });
  return members.map((m: { business: unknown }) => m.business as Awaited<ReturnType<typeof getBusinessById>>);
}

export async function getBusinessById(businessId: string) {
  return prisma.business.findUnique({
    where: { id: businessId },
    include: { paymentSetting: true, members: true },
  });
}

export async function updateBusiness(
  businessId: string,
  userId: string,
  data: Partial<{ name: string; phone: string; email: string; address: string; description: string; logoUrl: string }>
) {
  const b = await prisma.business.update({ where: { id: businessId }, data });
  await logAuditEvent({
    businessId,
    userId,
    action: "BUSINESS_SETTINGS_CHANGED",
    entityType: "Business",
    entityId: b.id,
    metadata: { fields: Object.keys(data) },
  });
  return b;
}
