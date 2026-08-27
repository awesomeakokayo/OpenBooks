import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { requireBusinessMember } from "@/lib/security/tenant";
import { getReports } from "@/lib/reports/reports";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as unknown as { id: string }).id;
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
  try {
    await requireBusinessMember(userId, businessId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const reports = await getReports(businessId);
  return NextResponse.json(reports);
}
