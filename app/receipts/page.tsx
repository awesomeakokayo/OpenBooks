import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";

export default async function ReceiptsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as unknown as { id: string }).id;
  const member = await prisma.businessMember.findFirst({ where: { userId }, include: { business: true } });
  if (!member) redirect("/create-business");

  const receipts = await prisma.receipt.findMany({
    where: { businessId: member.business.id },
    include: { customer: true, invoice: true },
    orderBy: { issuedAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-[1200px] flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-plum">Receipts</h1>
        <p className="text-sm text-plum/60">{receipts.length} receipts</p>
      </div>

      {receipts.length === 0 ? (
        <div className="rounded-[16px] bg-pale-sage p-12 text-center">
          <p className="font-heading font-bold text-plum">No receipts yet</p>
          <p className="mt-1 text-sm text-plum/60">Every successful payment generates a receipt.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {receipts.map((r) => (
            <Link key={r.id} href={`/receipts/${r.id}`} className="flex items-center justify-between rounded-[16px] border border-plum/10 bg-white px-5 py-4 hover:shadow-[0_4px_20px_rgba(80,48,71,0.06)]">
              <div>
                <p className="text-sm font-semibold text-plum">{r.receiptNumber} • {r.customer.name}</p>
                <p className="text-xs text-plum/50">{r.paymentMethod} • {new Date(r.issuedAt).toLocaleDateString("en-NG")} {r.invoice ? `• ${r.invoice.invoiceNumber}` : ""}</p>
              </div>
              <span className="text-sm font-bold text-plum">₦{Number(r.amount).toLocaleString("en-NG")}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
