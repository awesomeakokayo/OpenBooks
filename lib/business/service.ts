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
  const parsedBusiness = businessSchema.safeParse({ name: params.name, phone: params.phone, email: params.email, address: params.address, description: params.description });
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
        name: parsedBusiness.data.name,
        phone: parsedBusiness.data.phone,
        email: parsedBusiness.data.email || null,
        address: parsedBusiness.data.address || null,
        logoUrl: params.logoUrl || null,
        description: parsedBusiness.data.description || null,
        currency: "NGN",
      },
    });
    await tx.businessMember.create({ data: { userId: params.userId, businessId: b.id, role: "OWNER" } });
    await tx.businessPaymentSetting.create({
      data: {
        businessId: b.id,
        bankTransferEnabled: parsedPayments.data.bankTransferEnabled,
        cashEnabled: parsedPayments.data.cashEnabled,
        posEnabled: parsedPayments.data.posEnabled,
        paystackEnabled: false,
        bankName: parsedPayments.data.bankName || null,
        accountName: parsedPayments.data.accountName || null,
        accountNumber: parsedPayments.data.accountNumber || null,
      },
    });
    return b;
  });

  await logAuditEvent({ businessId: business.id, userId: params.userId, action: "BUSINESS_CREATED", entityType: "Business", entityId: business.id });
  return business;
}

export async function getBusinessesForUser(userId: string) {
  const members = await prisma.businessMember.findMany({
    where: { userId },
    include: { business: { include: { paymentSetting: true } } },
  });
  return members.map((member) => member.business);
}

export async function getBusinessById(businessId: string) {
  return prisma.business.findUnique({ where: { id: businessId }, include: { paymentSetting: true, members: true } });
}

export async function updateBusiness(
  businessId: string,
  userId: string,
  data: Partial<{ name: string; phone: string; email: string; address: string; description: string; logoUrl: string }>
) {
  const b = await prisma.business.update({ where: { id: businessId }, data });
  await logAuditEvent({ businessId, userId, action: "BUSINESS_SETTINGS_CHANGED", entityType: "Business", entityId: b.id, metadata: { fields: Object.keys(data) } });
  return b;
}
