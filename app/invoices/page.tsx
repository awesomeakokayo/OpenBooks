import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowUpRight, FileText, Plus } from "lucide-react";
import { getStatusLabel, StatusBadge } from "@/components/ui/StatusBadge";

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
    <div className="mx-auto flex max-w-[1180px] flex-col gap-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="openbooks-eyebrow text-terracotta">Money out & in</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-plum">Invoices</h1>
          <p className="mt-1.5 text-sm text-plum/55">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""} in your records.</p>
        </div>
        <Link href="/invoices/new" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-terracotta px-5 text-sm font-bold !text-white shadow-[0_10px_28px_rgba(192,87,70,0.2)] hover:bg-terracotta-dark sm:h-11 sm:w-auto"><Plus size={17} className="text-white" /> Create invoice</Link>
      </section>

      <div className="rounded-2xl border border-plum/10 bg-white p-3 shadow-[0_8px_24px_rgba(80,48,71,0.04)]">
        <div className="flex gap-2 overflow-x-auto openbooks-scrollbar-hidden">
          {statuses.map((s) => (
            <Link key={s || "all"} href={s ? `/invoices?status=${s}` : "/invoices"} className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${!status && !s ? "bg-plum !text-white" : status === s ? "bg-pale-sage text-plum" : "text-plum/50 hover:bg-[#F8F8F6] hover:text-plum"}`}>{s ? getStatusLabel(s) : "All invoices"}</Link>
          ))}
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-3xl bg-pale-sage p-10 text-center sm:p-14">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/75 text-plum shadow-sm"><FileText size={23} /></span>
          <h2 className="mt-5 font-heading text-lg font-extrabold">No invoices yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-plum/55">Create a professional invoice, choose the payment methods you accept, and send it to your customer.</p>
          <Link href="/invoices/new" className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-plum px-5 text-sm font-bold !text-white hover:bg-plum-deep sm:h-11 sm:w-auto"><Plus size={16} className="text-white" /> Create invoice</Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-plum/10 bg-white shadow-[0_12px_32px_rgba(80,48,71,0.05)]">
          <div className="hidden grid-cols-[1.25fr_1fr_0.75fr_0.8fr_28px] gap-4 border-b border-plum/10 bg-[#F8F8F6] px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-plum/40 sm:grid">
            <span>Invoice</span><span>Customer</span><span>Issued</span><span>Amount</span><span />
          </div>
          <div className="divide-y divide-plum/10">
            {invoices.map((inv) => (
              <Link key={inv.id} href={`/invoices/${inv.id}`} className="group grid gap-3 px-5 py-4 transition hover:bg-[#F8F8F6] sm:grid-cols-[1.25fr_1fr_0.75fr_0.8fr_28px] sm:items-center sm:gap-4">
                <div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pale-sage text-plum"><FileText size={16} /></span><div className="min-w-0"><p className="truncate text-sm font-bold text-plum">{inv.invoiceNumber}</p><p className="text-xs text-plum/40 sm:hidden">{inv.customer.name}</p></div></div>
                <p className="truncate text-sm font-medium text-plum/60">{inv.customer.name}</p>
                <div><p className="text-sm font-medium text-plum/60">{new Date(inv.issueDate).toLocaleDateString("en-NG")}</p><p className="text-xs text-plum/35 sm:hidden">{inv.dueDate ? `Due ${new Date(inv.dueDate).toLocaleDateString("en-NG")}` : "No due date"}</p></div>
                <div className="flex items-center justify-between gap-3 sm:block"><p className="text-sm font-extrabold text-plum">₦{Number(inv.total).toLocaleString("en-NG")}</p><StatusBadge status={inv.status} /></div>
                <span className="hidden justify-end text-terracotta sm:flex"><ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
