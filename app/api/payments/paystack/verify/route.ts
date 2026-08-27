import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyTransaction } from "@/lib/paystack/client";
import { issueReceipt } from "@/lib/receipts/service";

export async function POST(req: NextRequest) {
  const { reference } = (await req.json()) as { reference?: string };
  if (!reference) return NextResponse.json({ error: "reference required" }, { status: 400 });

  const pending = await prisma.payment.findUnique({ where: { providerReference: reference } });
  if (!pending) return NextResponse.json({ error: "Payment not found for reference" }, { status: 404 });
  if (pending.status === "SUCCESS") {
    return NextResponse.json({ status: "already_verified", payment: pending });
  }

  let verified;
  try {
    verified = await verifyTransaction(reference);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Verify failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  if (verified.status !== "success") {
    await prisma.payment.update({ where: { providerReference: reference }, data: { status: "FAILED" } });
    return NextResponse.json({ error: `Transaction not successful: ${verified.status}` }, { status: 400 });
  }
  if (verified.currency !== "NGN") {
    return NextResponse.json({ error: "Currency mismatch" }, { status: 400 });
  }
  const amountNaira = verified.amount / 100;
  // Check amount matches pending (allow minor due to multiple partials? strict for now)
  if (Math.abs(amountNaira - Number(pending.amount)) > 0.01) {
    // Still allow but log; for partials we require exact outstanding at init time
    return NextResponse.json({ error: `Amount mismatch: expected ${pending.amount} got ${amountNaira}` }, { status: 400 });
  }

  // Verify invoice association still valid
  const invoice = pending.invoiceId
    ? await prisma.invoice.findUnique({
        where: { id: pending.invoiceId },
        include: { payments: { where: { status: "SUCCESS" } } },
      })
    : null;

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.update({
      where: { providerReference: reference },
      data: { status: "SUCCESS", verifiedAt: new Date() },
    });
    const receipt = await issueReceipt(tx, {
      businessId: payment.businessId,
      paymentId: payment.id,
      invoiceId: payment.invoiceId,
      customerId: payment.customerId,
      amount: Number(payment.amount),
      paymentMethod: payment.method as string,
    });
    if (invoice) {
      const total = Number(invoice.total);
      const all = await tx.payment.findMany({ where: { invoiceId: invoice.id, status: "SUCCESS" }, select: { amount: true } });
      const totalPaid = all.reduce((s, p) => s + Number(p.amount), 0);
      const nextStatus = totalPaid >= total ? "PAID" : totalPaid > 0 ? "PARTIALLY_PAID" : invoice.status;
      await tx.invoice.update({ where: { id: invoice.id }, data: { status: nextStatus as never } });
      return { payment, receipt, nextStatus };
    }
    return { payment, receipt, nextStatus: null };
  });

  return NextResponse.json({ status: "verified", ...result });
}
