import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/security/admin";

export const dynamic = "force-dynamic";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-NG").format(value);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function AdminAnalyticsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [userCount, businessCount, customerCount, invoiceCount, successfulPaymentCount, paidAmount, expenseAmount, recentUsers, invoiceStatuses, recentInvoices, recentEvents] = await Promise.all([
    prisma.user.count(),
    prisma.business.count(),
    prisma.customer.count(),
    prisma.invoice.count(),
    prisma.payment.count({ where: { status: "SUCCESS" } }),
    prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 10, select: { id: true, name: true, email: true, createdAt: true } }),
    prisma.invoice.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.invoice.findMany({ orderBy: { createdAt: "desc" }, take: 10, select: { id: true, invoiceNumber: true, total: true, status: true, createdAt: true, business: { select: { name: true } } } }),
    prisma.auditEvent.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 30, select: { id: true, action: true, entityType: true, createdAt: true, user: { select: { name: true, email: true } }, business: { select: { name: true } } } }),
  ]);

  const paidTotal = Number(paidAmount._sum.amount ?? 0);
  const expensesTotal = Number(expenseAmount._sum.amount ?? 0);
  const invoiceStatusMap = Object.fromEntries(invoiceStatuses.map((row) => [row.status, row._count._all]));

  return (
    <main className="min-h-screen bg-[#F8F8F6] text-[#503047]">
      <div className="border-b border-[#503047]/10 bg-[#503047] text-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5 lg:px-8">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D0E3C4]">OpenBooks</p><h1 className="mt-1 font-heading text-2xl font-extrabold">Founder analytics</h1></div>
          <a href="/" className="text-sm font-semibold text-white/70 hover:text-white">Back to site</a>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 py-8 lg:px-8 lg:py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[["Users", formatNumber(userCount), "Registered accounts"], ["Businesses", formatNumber(businessCount), "Business workspaces"], ["Invoices", formatNumber(invoiceCount), "Invoices generated"], ["Payments", formatMoney(paidTotal), `${formatNumber(successfulPaymentCount)} successful payments`]].map(([label, value, detail]) => (
            <article key={label} className="rounded-3xl border border-[#E5E3DF] bg-white p-6 shadow-[0_14px_45px_rgba(80,48,71,0.07)]"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#918A91]">{label}</p><p className="mt-3 font-heading text-3xl font-extrabold tracking-tight">{value}</p><p className="mt-2 text-sm text-[#918A91]">{detail}</p></article>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-3xl border border-[#E5E3DF] bg-white p-6"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C05746]">Invoices</p><h2 className="mt-1 font-heading text-xl font-bold">Current status</h2></div><p className="text-sm text-[#918A91]">{formatNumber(invoiceCount)} total</p></div><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["DRAFT", invoiceStatusMap.DRAFT ?? 0], ["SENT", invoiceStatusMap.SENT ?? 0], ["PAID", invoiceStatusMap.PAID ?? 0], ["OVERDUE", invoiceStatusMap.OVERDUE ?? 0]].map(([status, count]) => <div key={status} className="rounded-2xl bg-[#F8F8F6] p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#918A91]">{status}</p><p className="mt-2 font-heading text-2xl font-bold">{formatNumber(Number(count))}</p></div>)}</div></section>
          <section className="rounded-3xl bg-[#D0E3C4] p-6"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#503047]">Business snapshot</p><div className="mt-5 space-y-4"><div className="flex items-center justify-between border-b border-[#503047]/10 pb-3"><span className="text-sm">Customers</span><strong>{formatNumber(customerCount)}</strong></div><div className="flex items-center justify-between border-b border-[#503047]/10 pb-3"><span className="text-sm">Successful payments</span><strong>{formatNumber(successfulPaymentCount)}</strong></div><div className="flex items-center justify-between"><span className="text-sm">Recorded expenses</span><strong>{formatMoney(expensesTotal)}</strong></div></div></section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-[#E5E3DF] bg-white p-6"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C05746]">Users</p><h2 className="mt-1 font-heading text-xl font-bold">Recent signups</h2></div><p className="text-xs text-[#918A91]">Newest first</p></div><div className="mt-5 divide-y divide-[#E5E3DF]">{recentUsers.length ? recentUsers.map((user) => <div key={user.id} className="flex items-center justify-between gap-4 py-4"><div className="min-w-0"><p className="truncate text-sm font-semibold">{user.name || "Unnamed user"}</p><p className="truncate text-xs text-[#918A91]">{user.email || "No email"}</p></div><time className="shrink-0 text-xs text-[#918A91]">{formatDate(user.createdAt)}</time></div>) : <p className="py-4 text-sm text-[#918A91]">No users yet.</p>}</div></section>
          <section className="rounded-3xl border border-[#E5E3DF] bg-white p-6"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C05746]">Invoices</p><h2 className="mt-1 font-heading text-xl font-bold">Recent invoices</h2></div><p className="text-xs text-[#918A91]">Newest first</p></div><div className="mt-5 divide-y divide-[#E5E3DF]">{recentInvoices.length ? recentInvoices.map((invoice) => <div key={invoice.id} className="flex items-center justify-between gap-4 py-4"><div className="min-w-0"><p className="truncate text-sm font-semibold">{invoice.invoiceNumber}</p><p className="truncate text-xs text-[#918A91]">{invoice.business.name}</p></div><div className="shrink-0 text-right"><p className="text-sm font-bold">{formatMoney(Number(invoice.total))}</p><p className="text-xs text-[#918A91]">{invoice.status}</p></div></div>) : <p className="py-4 text-sm text-[#918A91]">No invoices yet.</p>}</div></section>
        </div>

        <section className="mt-6 rounded-3xl border border-[#E5E3DF] bg-white p-6"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C05746]">Product activity</p><h2 className="mt-1 font-heading text-xl font-bold">Recent events</h2></div><p className="text-xs text-[#918A91]">Last 30 days</p></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b border-[#E5E3DF] text-xs uppercase tracking-[0.14em] text-[#918A91]"><th className="pb-3 pr-4">Time</th><th className="pb-3 pr-4">Action</th><th className="pb-3 pr-4">User</th><th className="pb-3 pr-4">Business</th><th className="pb-3">Entity</th></tr></thead><tbody className="divide-y divide-[#E5E3DF]">{recentEvents.map((event) => <tr key={event.id}><td className="py-3 pr-4 whitespace-nowrap text-[#918A91]">{formatDate(event.createdAt)}</td><td className="py-3 pr-4 font-semibold">{event.action}</td><td className="py-3 pr-4">{event.user?.email || event.user?.name || "System"}</td><td className="py-3 pr-4">{event.business?.name || "—"}</td><td className="py-3">{event.entityType}</td></tr>)}</tbody></table>{!recentEvents.length ? <p className="py-6 text-sm text-[#918A91]">No tracked activity in the last 30 days.</p> : null}</div></section>
      </div>
    </main>
  );
}
