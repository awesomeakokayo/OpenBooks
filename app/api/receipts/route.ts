import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { requireBusinessMember } from "@/lib/security/tenant";
import { userError } from "@/lib/security/error";

function parsePage(value: string | null) { const n = Number(value ?? 1); return Number.isInteger(n) && n > 0 ? n : 1; }
function parseLimit(value: string | null) { const n = Number(value ?? 25); return Number.isInteger(n) && n > 0 && n <= 100 ? n : 25; }

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return userError("Unauthorized", 401);
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return userError("businessId required", 400);
  try {
    await requireBusinessMember(userId, businessId);
    const page = parsePage(req.nextUrl.searchParams.get("page"));
    const limit = parseLimit(req.nextUrl.searchParams.get("limit"));
    const where = { businessId };
    const [items, total] = await Promise.all([
      prisma.receipt.findMany({ where, include: { customer: true, invoice: true, payment: true }, orderBy: [{ issuedAt: "desc" }, { id: "desc" }], skip: (page - 1) * limit, take: limit }),
      prisma.receipt.count({ where }),
    ]);
    return Response.json({ items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch { return userError("Could not load receipts", 500); }
}
