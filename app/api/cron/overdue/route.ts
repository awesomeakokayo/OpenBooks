import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Vercel Cron — runs daily, marks overdue invoices
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/overdue", "schedule": "0 2 * * *" }] }
// Protect with CRON_SECRET header if set

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  const result = await prisma.invoice.updateMany({
    where: {
      dueDate: { lt: now },
      status: { in: ["SENT", "VIEWED", "PARTIALLY_PAID"] as never },
    },
    data: { status: "OVERDUE" as never },
  });

  return NextResponse.json({ updated: result.count, at: now.toISOString() });
}
