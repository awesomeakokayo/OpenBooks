import { prisma } from "@/lib/db/prisma";
import type { MemberRole } from "@prisma/client";

export async function requireBusinessRole(
  userId: string,
  businessId: string,
  allowedRoles: MemberRole[]
) {
  const membership = await prisma.businessMember.findUnique({
    where: { userId_businessId: { userId, businessId } },
    select: { role: true },
  });

  if (!membership) {
    throw Object.assign(new Error("Not a member of this business"), { status: 403 });
  }

  if (!allowedRoles.includes(membership.role)) {
    throw Object.assign(new Error("Insufficient permissions"), { status: 403 });
  }

  return membership;
}

export function requireBusinessAdmin(userId: string, businessId: string) {
  return requireBusinessRole(userId, businessId, ["OWNER", "ADMIN"]);
}

export function requireBusinessOwner(userId: string, businessId: string) {
  return requireBusinessRole(userId, businessId, ["OWNER"]);
}
