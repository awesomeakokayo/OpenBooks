import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as unknown as { id: string }).id;
  const member = await prisma.businessMember.findFirst({ where: { userId }, include: { business: true } });
  if (!member) redirect("/create-business");
  const businessId = member.business.id;
  const { status } = await searchParams;

  const invoices = await prisma.invoice.findMany({
    where: { businessId, ...(status ? { status: status as never } : {}) },
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const statuses = ["", "DRAFT", "SENT", "VIEWED", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"];

  return (
    <div className="mx-auto max-w-[1200px] flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-plum">Invoices</h1>
          <p className="text-sm text-plum/60">{invoices.length} invoices</p>
        </div>
        <Link href="/invoices/new" className="inline-flex h-11 items-center justify-center rounded-[12px] bg-terracotta px-6 text-sm font-semibold text-white hover:bg-terracotta/90">
          + Create Invoice
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {statuses.map((s) => (
          <Link
            key={s || "all"}
            href={s ? `/invoices?status=${s}` : "/invoices"}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold ${!status && !s ? "bg-plum text-white" : status === s ? "bg-pale-sage text-plum" : "border border-plum/10 text-plum/60"}`}
          >
            {s || "All"}
          </Link>
        ))}
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-[16px] bg-pale-sage p-12 text-center">
          <p className="font-heading font-bold text-plum">No invoices yet</p>
          <p className="mt-1 text-sm text-plum/60">Create your first professional invoice.</p>
          <Link href="/invoices/new" className="mt-4 inline-flex h-11 items-center justify-center rounded-[12px] bg-plum px-6 text-sm font-semibold text-white">
            Create Invoice
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {invoices.map((inv) => (
            <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between rounded-[16px] border border-plum/10 bg-white px-5 py-4 hover:shadow-[0_4px_20px_rgba(80,48,71,0.06)]">
              <div>
                <p className="text-sm font-semibold text-plum">{inv.invoiceNumber} • {inv.customer.name}</p>
                <p className="text-xs text-plum/50">{new Date(inv.issueDate).toLocaleDateString("en-NG")} {inv.dueDate ? `• Due ${new Date(inv.dueDate).toLocaleDateString("en-NG")}` : ""}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-plum">₦{Number(inv.total).toLocaleString("en-NG")}</span>
                <StatusBadge status={inv.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
