import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Vercel Cron — runs daily, marks overdue invoices.
// Production requires CRON_SECRET. Never fail open when it is missing.

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "Cron endpoint is not configured" }, { status: 503 });
  }

  const authorization = req.headers.get("authorization");
  if (authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const result = await prisma.invoice.updateMany({
    where: {
      dueDate: { lt: now },
      status: { in: ["SENT", "VIEWED", "PARTIALLY_PAID"] },
    },
    data: { status: "OVERDUE" },
  });

  return NextResponse.json({ updated: result.count, at: now.toISOString() });
}
