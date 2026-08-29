import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect, notFound } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { RecordPaymentForm } from "@/components/payments/RecordPaymentForm";
import { CopyButton } from "@/components/ui/CopyButton";
import { InvoicePdfButton } from "@/components/invoices/InvoicePdfButton";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as unknown as { id: string }).id;
  const member = await prisma.businessMember.findFirst({ where: { userId }, include: { business: true } });
  if (!member) redirect("/create-business");
  const businessId = member.business.id;

  const invoice = await prisma.invoice.findFirst({
    where: { id, businessId },
    include: { customer: true, items: true, paymentMethods: true, payments: { where: { status: "SUCCESS" } }, business: { include: { paymentSetting: true } } },
  });
  if (!invoice) notFound();

  const amountPaid = invoice.payments.reduce((s, p) => s + Number(p.amount), 0);
  const outstanding = Math.max(0, Number(invoice.total) - amountPaid);
  const publicUrl = `${process.env.APP_URL || "http://localhost:3000"}/invoice/${invoice.publicToken}`;
  const waMessage = `Hello ${invoice.customer.name}, your invoice from ${invoice.business.name} is ₦${Number(invoice.total).toLocaleString("en-NG")}. View your invoice and payment options here: ${publicUrl}`;
  const waLink = `https://wa.me/?text=${encodeURIComponent(waMessage)}`;
  const manualPaymentMethods = invoice.paymentMethods.filter((pm) => ["BANK_TRANSFER", "CASH", "POS"].includes(pm.method));
  const setting = invoice.business.paymentSetting;
  const hasBankTransfer = manualPaymentMethods.some((pm) => pm.method === "BANK_TRANSFER");
  const hasBankDetails = Boolean(setting?.bankName && setting.accountName && setting.accountNumber);

  return (
    <div className="print-invoice mx-auto flex max-w-[720px] flex-col gap-6">
      <Link href="/invoices" className="print:hidden text-sm text-plum/60 hover:text-plum">← Back to invoices</Link>

      <div className="print-invoice-card rounded-[16px] border border-plum/10 bg-white p-6 shadow-[0_4px_20px_rgba(80,48,71,0.06)]">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            {invoice.business.logoUrl && <img src={invoice.business.logoUrl} alt={`${invoice.business.name} logo`} className="mb-4 h-12 w-auto max-w-[180px] object-contain" />}
            <p className="text-xs font-semibold tracking-widest text-plum/50">{invoice.invoiceNumber}</p>
            <h1 className="font-heading text-xl font-bold text-plum">{invoice.business.name}</h1>
            <p className="text-sm text-plum/60">{invoice.customer.name} {invoice.customer.phone ? `• ${invoice.customer.phone}` : ""}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="hidden text-[10px] font-extrabold uppercase tracking-[0.18em] text-plum/40 print:block">Invoice</p>
            <StatusBadge status={invoice.status} />
            <p className="mt-2 text-xs text-plum/50">Issued {new Date(invoice.issueDate).toLocaleDateString("en-NG")}</p>
          </div>
        </div>

        <div className="mt-6 rounded-[12px] bg-pale-sage/40 p-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-plum/50">Total due</p>
              <p className="text-3xl font-extrabold text-plum">₦{Number(invoice.total).toLocaleString("en-NG")}</p>
              <p className="text-xs text-plum/50">Subtotal ₦{Number(invoice.subtotal).toLocaleString("en-NG")} • Discount ₦{Number(invoice.discount).toLocaleString("en-NG")}</p>
            </div>
            {invoice.dueDate && <p className="text-xs font-semibold text-terracotta">Due {new Date(invoice.dueDate).toLocaleDateString("en-NG")}</p>}
          </div>
        </div>

        <div className="mt-6 border-t border-plum/10 pt-4">
          <p className="text-xs font-semibold text-plum/60">Items</p>
          <div className="mt-2 flex flex-col gap-2">
            {invoice.items.map((it) => (
              <div key={it.id} className="flex justify-between gap-4 rounded-[12px] border border-plum/10 px-4 py-2.5">
                <span className="text-sm text-plum">{it.description} × {Number(it.quantity)}</span>
                <span className="shrink-0 text-sm font-semibold text-plum">₦{Number(it.lineTotal).toLocaleString("en-NG")}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 print:hidden">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium text-plum/60">Payment methods:</span>
            {manualPaymentMethods.map((pm) => (
              <span key={pm.id} className="rounded-full bg-pale-sage px-3 py-1 text-xs font-semibold text-plum">{pm.method.replaceAll("_", " ")}</span>
            ))}
          </div>

          {hasBankTransfer && hasBankDetails && (
            <div className="rounded-[12px] border border-plum/10 bg-pale-sage/30 p-4">
              <p className="text-sm font-bold text-plum">Bank transfer details</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-plum/45">Bank</p>
                  <p className="text-sm font-semibold text-plum">{setting.bankName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-plum/45">Account name</p>
                  <p className="text-sm font-semibold text-plum">{setting.accountName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-plum/45">Account number</p>
                  <p className="text-sm font-bold tracking-[0.04em] text-plum">{setting.accountNumber}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {hasBankTransfer && hasBankDetails && (
          <div className="mt-6 hidden rounded-[12px] border border-plum/10 bg-pale-sage/30 p-4 print:block">
            <p className="text-sm font-bold text-plum">Bank transfer details</p>
            <div className="mt-3 grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-plum/45">Bank</p>
                <p className="text-sm font-semibold text-plum">{setting.bankName}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-plum/45">Account name</p>
                <p className="text-sm font-semibold text-plum">{setting.accountName}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-plum/45">Account number</p>
                <p className="text-sm font-bold tracking-[0.04em] text-plum">{setting.accountNumber}</p>
              </div>
            </div>
          </div>
        )}

        <div className="print:hidden mt-4 flex flex-col gap-1 rounded-[12px] bg-pale-sage/40 p-4">
          <p className="text-xs font-semibold text-plum">Public invoice</p>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="break-all text-xs text-terracotta hover:text-plum">{publicUrl}</a>
          <p className="text-xs text-plum/60">Paid ₦{amountPaid.toLocaleString("en-NG")} • Outstanding ₦{outstanding.toLocaleString("en-NG")}</p>
        </div>

        <div className="print:hidden mt-6 flex flex-col gap-2 sm:flex-row">
          <InvoicePdfButton />
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 w-full flex-1 items-center justify-center rounded-[12px] bg-sage px-6 text-sm font-semibold text-plum hover:bg-sage/80 sm:h-11">Share via WhatsApp</a>
          <CopyButton text={publicUrl} />
        </div>

        {invoice.notes && (
          <div className="mt-6 rounded-[12px] border border-plum/10 bg-white p-4">
            <p className="text-xs font-semibold text-plum/60">Notes</p>
            <p className="text-sm text-plum">{invoice.notes}</p>
          </div>
        )}

        <div className="mt-6 hidden border-t border-plum/10 pt-4 text-xs text-plum/50 print:block">
          <div className="flex flex-wrap justify-between gap-3">
            <span>{invoice.business.phone}</span>
            {invoice.business.email && <span>{invoice.business.email}</span>}
            {invoice.business.address && <span>{invoice.business.address}</span>}
          </div>
        </div>
      </div>

      {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
        <div className="print:hidden">
          <RecordPaymentForm businessId={businessId} invoiceId={invoice.id} customerId={invoice.customerId} outstanding={outstanding} />
        </div>
      )}

      {invoice.payments.length > 0 && (
        <div className="print:hidden rounded-[16px] border border-plum/10 bg-white p-6">
          <h3 className="font-heading text-sm font-bold text-plum">Payments</h3>
          <div className="mt-3 flex flex-col gap-2">
            {invoice.payments.map((p) => (
              <div key={p.id} className="flex justify-between gap-4 rounded-[12px] border border-plum/10 px-4 py-2.5">
                <span className="text-sm text-plum">{p.method.replaceAll("_", " ")} • {p.provider} • {p.verificationType}</span>
                <span className="text-sm font-semibold text-plum">₦{Number(p.amount).toLocaleString("en-NG")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
