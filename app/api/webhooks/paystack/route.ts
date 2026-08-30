import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyTransaction, verifyWebhookSignature } from "@/lib/paystack/client";
import { issueReceipt } from "@/lib/receipts/service";
import { checkRateLimit, LIMITS, rateLimitHeaders } from "@/lib/security/rateLimit";
import { logError } from "@/lib/security/error";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "webhook";
  const rl = await checkRateLimit(`webhook:${ip}`, LIMITS.webhook);
  if (!rl.allowed) return NextResponse.json({ error: "Webhook rate limited" }, { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) });
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  if (!verifyWebhookSignature(rawBody, signature)) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  let body: unknown;
  try { body = JSON.parse(rawBody); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const evt = body as { event?: string; data?: { reference?: string; amount?: number; currency?: string } };
  if (evt.event !== "charge.success") return NextResponse.json({ received: true });

  const reference = evt.data?.reference;
  if (!reference) return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  const existing = await prisma.payment.findUnique({ where: { providerReference: reference } });
  if (existing && existing.status === "SUCCESS") return NextResponse.json({ received: true, idempotent: true });

  let verified;
  try { verified = await verifyTransaction(reference); } catch (e: unknown) {
    const id = logError("webhook-verify", e, { reference });
    const msg = e instanceof Error ? e.message : "Verify failed";
    return NextResponse.json({ error: msg, requestId: id }, { status: 502 });
  }
  if (verified.status !== "success") {
    if (existing) await prisma.payment.update({ where: { providerReference: reference }, data: { status: "FAILED" } }).catch(() => {});
    return NextResponse.json({ received: true, verified: false });
  }
  if (verified.currency !== "NGN") return NextResponse.json({ error: "Currency mismatch" }, { status: 400 });

  const payment = existing;
  if (!payment) return NextResponse.json({ error: "No pending payment for reference" }, { status: 404 });
  const expectedKobo = Math.round(Number(payment.amount) * 100);
  if (verified.amount !== expectedKobo) return NextResponse.json({ error: `Amount mismatch: expected ${expectedKobo} got ${verified.amount}` }, { status: 400 });

  const invoice = payment.invoiceId ? await prisma.invoice.findUnique({ where: { id: payment.invoiceId }, include: { payments: { where: { status: "SUCCESS" } } } }) : null;
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({ where: { providerReference: reference }, data: { status: "SUCCESS", verifiedAt: new Date() } });
    const full = await tx.payment.findUnique({ where: { providerReference: reference } });
    if (!full) throw new Error("Payment missing after update");
    await issueReceipt(tx, { businessId: full.businessId, paymentId: full.id, invoiceId: full.invoiceId, customerId: full.customerId, amount: Number(full.amount), paymentMethod: full.method as string });
    if (invoice) {
      const total = Number(invoice.total);
      const all = await tx.payment.findMany({ where: { invoiceId: invoice.id, status: "SUCCESS" }, select: { amount: true } });
      const totalPaid = all.reduce((s, p) => s + Number(p.amount), 0);
      const nextStatus = totalPaid >= total ? "PAID" : totalPaid > 0 ? "PARTIALLY_PAID" : invoice.status;
      await tx.invoice.update({ where: { id: invoice.id }, data: { status: nextStatus as never } });
    }
  });
  return NextResponse.json({ received: true });
}
