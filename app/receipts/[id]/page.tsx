import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as unknown as { id: string }).id;
  const member = await prisma.businessMember.findFirst({ where: { userId }, include: { business: true } });
  if (!member) redirect("/create-business");

  const receipt = await prisma.receipt.findFirst({
    where: { id, businessId: member.business.id },
    include: { customer: true, invoice: { include: { items: true } }, business: true, payment: true },
  });
  if (!receipt) notFound();

  const business = receipt.business;

  return (
    <div className="mx-auto max-w-[640px] flex flex-col gap-6 print:max-w-none">
      <div className="rounded-[16px] border border-plum/10 bg-white p-8 shadow-[0_4px_20px_rgba(80,48,71,0.06)] print:shadow-none print:border-black/10">
        <div className="flex justify-between">
          <div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-plum text-sm font-bold text-white">OB</div>
            <p className="mt-2 font-heading text-lg font-bold text-plum">{business.name}</p>
            <p className="text-xs text-plum/60">{business.phone} {business.email ? `• ${business.email}` : ""} {business.address ? `• ${business.address}` : ""}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold tracking-widest text-plum/50">RECEIPT</p>
            <p className="font-heading text-sm font-bold text-plum">{receipt.receiptNumber}</p>
            <p className="mt-1 inline-flex rounded-full bg-sage px-3 py-1 text-xs font-bold text-plum">PAID</p>
          </div>
        </div>

        <div className="mt-6 rounded-[12px] bg-pale-sage/40 p-4">
          <p className="text-xs font-medium text-plum/60">Amount paid</p>
          <p className="text-3xl font-extrabold text-plum">₦{Number(receipt.amount).toLocaleString("en-NG")}</p>
          <p className="text-xs text-plum/60">{receipt.paymentMethod} • {receipt.payment.verificationType} • {new Date(receipt.issuedAt).toLocaleDateString("en-NG")}</p>
        </div>

        <div className="mt-6 grid gap-4 text-sm">
          <div className="flex justify-between border-b border-plum/10 py-2">
            <span className="text-plum/60">Customer</span>
            <span className="font-semibold text-plum">{receipt.customer.name} • {receipt.customer.phone}</span>
          </div>
          {receipt.invoice && (
            <>
              <div className="flex justify-between border-b border-plum/10 py-2">
                <span className="text-plum/60">Invoice</span>
                <span className="font-semibold text-plum">{receipt.invoice.invoiceNumber}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-plum/60">Items</span>
                {receipt.invoice.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-sm">
                    <span className="text-plum">{it.description} × {Number(it.quantity)}</span>
                    <span className="font-semibold text-plum">₦{Number(it.lineTotal).toLocaleString("en-NG")}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex gap-2 print:hidden">
          <button onClick={() => typeof window !== "undefined" && window.print()} className="flex-1 rounded-[12px] bg-plum px-6 py-3 text-sm font-semibold text-white hover:bg-plum/90">
            Print
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Receipt ${receipt.receiptNumber} from ${business.name} — ₦${Number(receipt.amount).toLocaleString("en-NG")} paid via ${receipt.paymentMethod}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-[12px] bg-sage px-6 py-3 text-center text-sm font-semibold text-plum hover:bg-sage/80"
          >
            Share via WhatsApp
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-plum/40">Thank you for your business • OpenBooks NG</p>
      </div>
    </div>
  );
}
