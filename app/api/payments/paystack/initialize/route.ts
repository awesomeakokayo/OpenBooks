import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { initializeTransaction } from "@/lib/paystack/client";
import { randomBytes } from "crypto";
import { checkRateLimit, LIMITS, rateLimitHeaders } from "@/lib/security/rateLimit";
import { logError } from "@/lib/security/error";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = await checkRateLimit(`paystack-init:${ip}`, LIMITS.paystackInit);
  if (!rl.allowed) return NextResponse.json({ error: "Too many payment attempts" }, { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) });
  const body = await req.json();
  const { invoiceToken } = body as { invoiceToken?: string };
  if (!invoiceToken) return NextResponse.json({ error: "invoiceToken required" }, { status: 400 });

  const invoice = await prisma.invoice.findUnique({ where: { publicToken: invoiceToken }, include: { business: { include: { paymentSetting: true } }, customer: true, paymentMethods: true, payments: { where: { status: "SUCCESS" } } } });
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (invoice.status === "PAID" || invoice.status === "CANCELLED") return NextResponse.json({ error: `Invoice is ${invoice.status}` }, { status: 400 });
  const hasPaystack = invoice.paymentMethods.some((pm) => pm.method === "PAYSTACK");
  if (!hasPaystack) return NextResponse.json({ error: "Paystack not enabled for this invoice" }, { status: 400 });

  const total = Number(invoice.total);
  const paid = invoice.payments.reduce((s, p) => s + Number(p.amount), 0);
  const outstanding = Math.max(0, total - paid);
  if (outstanding <= 0) return NextResponse.json({ error: "No outstanding amount" }, { status: 400 });

  const amountKobo = Math.round(outstanding * 100);
  const reference = `OB_${invoice.id.slice(0, 8)}_${Date.now()}_${randomBytes(3).toString("hex")}`;
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const callbackUrl = `${appUrl}/invoice/${invoice.publicToken}?reference=${reference}`;
  const email = invoice.customer.email || invoice.business.email || `customer+${invoice.customerId}@openbooks.local`;

  await prisma.payment.create({ data: { businessId: invoice.businessId, invoiceId: invoice.id, customerId: invoice.customerId, amount: outstanding, currency: "NGN", method: "PAYSTACK", provider: "PAYSTACK", status: "PENDING", providerReference: reference, verificationType: "AUTOMATIC", metadata: { via: "initialize", publicToken: invoice.publicToken } as never } });

  try {
    const data = await initializeTransaction({ amountKobo, email, reference, callbackUrl, subaccount: invoice.business.paystackSubaccountCode || null, metadata: { businessId: invoice.businessId, invoiceId: invoice.id, customerId: invoice.customerId, publicToken: invoice.publicToken, invoiceNumber: invoice.invoiceNumber } });
    return NextResponse.json({ authorization_url: data.authorization_url, reference: data.reference });
  } catch (e: unknown) {
    await prisma.payment.update({ where: { providerReference: reference }, data: { status: "FAILED" } }).catch(() => {});
    const id = logError("paystack-init", e, { invoiceToken: invoice.publicToken });
    const msg = e instanceof Error ? e.message : "Paystack initialize failed";
    return NextResponse.json({ error: msg, requestId: id }, { status: 502 });
  }
}
