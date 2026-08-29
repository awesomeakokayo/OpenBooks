import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { logAuditEvent } from "@/lib/audit/logger";
import { OpenBooksBrandMark } from "@/components/openbooks-brand-mark";

// Public invoice — no auth required, token-based, minimal leak

export default async function PublicInvoicePage({ params }: { params: Promise<{ publicToken: string }> }) {
  const { publicToken } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { publicToken },
    include: {
      business: { include: { paymentSetting: true } },
      customer: true,
      items: true,
      paymentMethods: true,
      payments: { where: { status: "SUCCESS" } },
    },
  });
  if (!invoice) notFound();

  if (invoice.status === "SENT" || invoice.status === "DRAFT") {
    await prisma.invoice.update({ where: { id: invoice.id }, data: { status: "VIEWED" } });
    await logAuditEvent({ businessId: invoice.businessId, action: "INVOICE_VIEWED", entityType: "Invoice", entityId: invoice.id, metadata: { publicToken } });
  }

  const amountPaid = invoice.payments.reduce((s, p) => s + Number(p.amount), 0);
  const outstanding = Math.max(0, Number(invoice.total) - amountPaid);
  const setting = invoice.business.paymentSetting;
  const enabled = new Set(invoice.paymentMethods.map((pm) => pm.method).filter((method) => ["BANK_TRANSFER", "CASH", "POS"].includes(method)));

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex max-w-[720px] flex-col gap-6 px-6 py-8">
        <div className="flex items-center gap-2">
          <OpenBooksBrandMark size={32} />
          <span className="font-heading text-sm font-bold text-plum">OpenBooks NG</span>
        </div>

        <div className="rounded-[16px] border border-plum/10 bg-white p-6 shadow-[0_4px_20px_rgba(80,48,71,0.06)]">
          <p className="text-xs font-semibold tracking-widest text-plum/50">{invoice.invoiceNumber}</p>
          <p className="font-heading text-lg font-bold text-plum">Invoice from {invoice.business.name}</p>
          <p className="text-sm text-plum/60">For {invoice.customer.name}</p>

          <div className="mt-6 rounded-[12px] bg-pale-sage/40 p-4">
            <p className="text-xs font-medium text-plum/60">Amount due</p>
            <p className="text-3xl font-extrabold text-plum">₦{Number(invoice.total).toLocaleString("en-NG")}</p>
            {outstanding !== Number(invoice.total) && <p className="text-xs text-plum/60">Paid ₦{amountPaid.toLocaleString("en-NG")} • Outstanding ₦{outstanding.toLocaleString("en-NG")}</p>}
            {invoice.dueDate && <p className="mt-1 text-xs font-semibold text-terracotta">Due {new Date(invoice.dueDate).toLocaleDateString("en-NG")}</p>}
            <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${invoice.status === "PAID" ? "bg-sage text-plum" : invoice.status === "OVERDUE" ? "bg-terracotta text-white" : "bg-white text-plum border border-plum/10"}`}>{invoice.status}</p>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold text-plum/60">Items</p>
            <div className="mt-2 flex flex-col gap-2">
              {invoice.items.map((it) => (
                <div key={it.id} className="flex justify-between rounded-[12px] border border-plum/10 px-4 py-2.5">
                  <span className="text-sm text-plum">{it.description} × {Number(it.quantity)}</span>
                  <span className="text-sm font-semibold text-plum">₦{Number(it.lineTotal).toLocaleString("en-NG")}</span>
                </div>
              ))}
            </div>
          </div>

          {invoice.notes && <p className="mt-4 rounded-[12px] bg-plum/[0.03] p-3 text-sm text-plum/70">{invoice.notes}</p>}

          <div className="mt-6 border-t border-plum/10 pt-6">
            <h2 className="font-heading text-sm font-bold text-plum">How to pay</h2>

            {enabled.has("BANK_TRANSFER") && setting?.bankName && setting.accountName && setting.accountNumber && (
              <div className="mt-3 rounded-[12px] border border-plum/10 bg-white p-4">
                <p className="text-sm font-bold text-plum">Bank Transfer</p>
                <div className="mt-3 grid gap-2">
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
                    <p className="text-lg font-bold tracking-[0.04em] text-plum">{setting.accountNumber}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-plum/50">Copy the account number and transfer directly. Your payment will be confirmed by the business.</p>
              </div>
            )}

            {enabled.has("CASH") && (
              <div className="mt-3 rounded-[12px] border border-plum/10 bg-white p-4">
                <p className="text-sm font-bold text-plum">Cash</p>
                <p className="text-xs text-plum/60">Pay in person — business will record receipt.</p>
              </div>
            )}

            {enabled.has("POS") && (
              <div className="mt-3 rounded-[12px] border border-plum/10 bg-white p-4">
                <p className="text-sm font-bold text-plum">POS</p>
                <p className="text-xs text-plum/60">Pay via terminal — business will record receipt.</p>
              </div>
            )}

            {invoice.status === "PAID" && <p className="mt-4 rounded-[12px] bg-sage px-4 py-3 text-sm font-semibold text-plum">✓ This invoice is paid. Thank you!</p>}
          </div>

          <div className="mt-6 flex flex-col gap-2 text-xs text-plum/50">
            <p>
              Questions? Contact {invoice.business.name} {invoice.business.phone ? `• ${invoice.business.phone}` : ""} {invoice.business.email ? `• ${invoice.business.email}` : ""}
            </p>
            <p>Public invoice • Do not share sensitive info beyond this link.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
