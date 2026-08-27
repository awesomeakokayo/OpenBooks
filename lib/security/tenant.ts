import { prisma } from "@/lib/db/prisma";

/**
 * Throws if user is not a member of the business.
 * Use at the top of every business-scoped route handler / server action.
 */
export async function requireBusinessMember(userId: string, businessId: string) {
  const membership = await prisma.businessMember.findUnique({
    where: { userId_businessId: { userId, businessId } },
  });
  if (!membership) {
    throw Object.assign(new Error("Not a member of this business"), { status: 403 });
  }
  return membership;
}

export async function getUserBusinessIds(userId: string): Promise<string[]> {
  const members = await prisma.businessMember.findMany({
    where: { userId },
    select: { businessId: true },
  });
  return members.map((m: { businessId: string }) => m.businessId);
}
