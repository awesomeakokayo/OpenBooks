import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { requireBusinessMember } from "@/lib/security/tenant";
import { getReports } from "@/lib/reports/reports";
import { userError } from "@/lib/security/error";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return userError("Unauthorized", 401);
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return userError("businessId required", 400);
  try { await requireBusinessMember(userId, businessId); } catch { return userError("Forbidden", 403); }
  try { return Response.json(await getReports(businessId)); } catch { return userError("Could not load reports", 500); }
}
