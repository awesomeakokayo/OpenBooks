import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";

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

  return (
    <div className="mx-auto max-w-[720px] flex flex-col gap-6">
      <Link href="/invoices" className="text-sm text-plum/60 hover:text-plum">
        ← Back to invoices
      </Link>

      <div className="rounded-[16px] border border-plum/10 bg-white p-6 shadow-[0_4px_20px_rgba(80,48,71,0.06)]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-plum/50">{invoice.invoiceNumber}</p>
            <h1 className="font-heading text-xl font-bold text-plum">{invoice.business.name}</h1>
            <p className="text-sm text-plum/60">{invoice.customer.name} • {invoice.customer.phone}</p>
          </div>
          <StatusBadge status={invoice.status} />
        </div>

        <div className="mt-6">
          <p className="text-xs font-medium text-plum/50">Total due</p>
          <p className="text-3xl font-extrabold text-plum">₦{Number(invoice.total).toLocaleString("en-NG")}</p>
          <p className="text-xs text-plum/50">Subtotal ₦{Number(invoice.subtotal).toLocaleString("en-NG")} • Discount ₦{Number(invoice.discount).toLocaleString("en-NG")}</p>
          {invoice.dueDate && <p className="mt-1 text-xs text-terracotta font-semibold">Due {new Date(invoice.dueDate).toLocaleDateString("en-NG")}</p>}
        </div>

        <div className="mt-6 border-t border-plum/10 pt-4">
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

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="text-xs font-medium text-plum/60">Payment methods:</span>
          {invoice.paymentMethods.map((pm) => (
            <span key={pm.id} className="rounded-full bg-pale-sage px-3 py-1 text-xs font-semibold text-plum">
              {pm.method}
            </span>
          ))}
        </div>

        <div className="mt-4 rounded-[12px] bg-pale-sage/40 p-4 flex flex-col gap-1">
          <p className="text-xs font-semibold text-plum">Public invoice</p>
          <a href={publicUrl} target="_blank" className="text-xs break-all text-terracotta hover:text-plum">
            {publicUrl}
          </a>
          <p className="text-xs text-plum/60">Paid ₦{amountPaid.toLocaleString("en-NG")} • Outstanding ₦{outstanding.toLocaleString("en-NG")}</p>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 flex-1 items-center justify-center rounded-[12px] bg-sage px-6 text-sm font-semibold text-plum hover:bg-sage/80">
            Share via WhatsApp
          </a>
          <button onClick={() => { if (typeof navigator !== 'undefined') navigator.clipboard.writeText(publicUrl); }} className="inline-flex h-11 flex-1 items-center justify-center rounded-[12px] border border-plum/10 bg-white px-6 text-sm font-semibold text-plum hover:bg-pale-sage">
            Copy link
          </button>
        </div>

        {invoice.notes && (
          <div className="mt-6 rounded-[12px] border border-plum/10 bg-white p-4">
            <p className="text-xs font-semibold text-plum/60">Notes</p>
            <p className="text-sm text-plum">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
