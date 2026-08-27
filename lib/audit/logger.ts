import { prisma } from "@/lib/db/prisma";

export async function logAuditEvent(params: {
  businessId?: string | null;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.auditEvent.create({
      data: {
        businessId: params.businessId ?? undefined,
        userId: params.userId ?? undefined,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata as never,
      },
    });
  } catch {
    // Audit failure should not break business logic — log to console
    console.error("[audit] failed to log", params.action);
  }
}
