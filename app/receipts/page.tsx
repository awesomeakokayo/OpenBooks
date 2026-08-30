import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";

const PAGE_SIZE = 25;

type ReceiptsPageProps = { searchParams: Promise<{ page?: string }> };

export default async function ReceiptsPage({ searchParams }: ReceiptsPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/login");
  const member = await prisma.businessMember.findFirst({ where: { userId }, include: { business: true } });
  if (!member) redirect("/create-business");
  const params = await searchParams;
  const rawPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const where = { businessId: member.business.id };

  const [receipts, totalCount] = await Promise.all([
    prisma.receipt.findMany({ where, include: { customer: true, invoice: true }, orderBy: [{ issuedAt: "desc" }, { id: "desc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.receipt.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  return (
    <div className="mx-auto max-w-[1200px] flex flex-col gap-6">
      <div><h1 className="font-heading text-2xl font-bold text-plum">Receipts</h1><p className="text-sm text-plum/60">{totalCount} receipt{totalCount !== 1 ? "s" : ""}</p></div>

      {receipts.length === 0 ? (
        <div className="rounded-[16px] bg-pale-sage p-12 text-center"><p className="font-heading font-bold text-plum">No receipts yet</p><p className="mt-1 text-sm text-plum/60">Every successful payment generates a receipt.</p></div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {receipts.map((r) => <Link key={r.id} href={`/receipts/${r.id}`} className="flex min-w-0 items-center justify-between gap-4 rounded-[16px] border border-plum/10 bg-white px-5 py-4 hover:shadow-[0_4px_20px_rgba(80,48,71,0.06)]"><div className="min-w-0"><p className="truncate text-sm font-semibold text-plum">{r.receiptNumber} • {r.customer.name}</p><p className="truncate text-xs text-plum/50">{r.paymentMethod.replaceAll("_", " ")} • {new Date(r.issuedAt).toLocaleDateString("en-NG")} {r.invoice ? `• ${r.invoice.invoiceNumber}` : ""}</p></div><span className="shrink-0 text-sm font-bold text-plum">₦{Number(r.amount).toLocaleString("en-NG")}</span></Link>)}
          </div>
          <div className="flex items-center justify-center gap-3 pt-1">
            {safePage > 1 ? <Link href={`/receipts?page=${safePage - 1}`} className="inline-flex h-10 items-center rounded-xl border border-plum/10 bg-white px-4 text-sm font-semibold text-plum hover:bg-pale-sage">Previous</Link> : null}
            <span className="text-xs font-semibold text-plum/50">Page {safePage} of {totalPages}</span>
            {safePage < totalPages ? <Link href={`/receipts?page=${safePage + 1}`} className="inline-flex h-10 items-center rounded-xl border border-plum/10 bg-white px-4 text-sm font-semibold text-plum hover:bg-pale-sage">Next</Link> : null}
          </div>
        </>
      )}
    </div>
  );
}
