import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getReports } from "@/lib/reports/reports";
import { getBusinessMonthOptions, formatMonthKey } from "@/lib/reports/months";
import { MonthSelector } from "@/components/reports/MonthSelector";

type ReportsPageProps = {
  searchParams: Promise<{ month?: string }>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as unknown as { id: string }).id;
  const member = await prisma.businessMember.findFirst({ where: { userId }, include: { business: true } });
  if (!member) redirect("/create-business");

  const businessId = member.business.id;
  const params = await searchParams;
  const months = await getBusinessMonthOptions(businessId);
  const selectedMonth = params.month && months.includes(params.month) ? params.month : months[0];
  const monthLabels = Object.fromEntries(months.map((month) => [month, formatMonthKey(month)]));
  const selectedLabel = monthLabels[selectedMonth];
  const reports = await getReports(businessId, selectedMonth);
  const money = (value: number) => `₦${value.toLocaleString("en-NG")}`;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] min-w-0 flex-col gap-8 overflow-x-hidden">
      <div className="flex w-full min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <p className="openbooks-eyebrow text-terracotta">Business performance</p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-plum">Reports</h1>
          <p className="mt-1 text-sm text-plum/60">{member.business.name} • Sales − Expenses = Net</p>
        </div>
        <MonthSelector basePath="/reports" selectedMonth={selectedMonth} months={months} labels={monthLabels} />
      </div>

      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-plum/10 bg-pale-sage px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-plum/40">Selected reporting period</p>
        <p className="mt-1 break-words text-sm font-bold text-plum">{selectedLabel}</p>
        <p className="mt-1 text-xs leading-5 text-plum/50">Monthly sales, payments and expenses below use this reporting window. Outstanding balances are current because they represent what customers owe you now.</p>
      </div>

      <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="min-w-0 overflow-hidden rounded-[16px] border border-plum/10 bg-white p-5">
          <p className="text-xs font-medium text-plum/50">Sales today</p>
          <p className="mt-1 break-words text-2xl font-extrabold text-plum">{money(reports.sales.today)}</p>
        </div>
        <div className="min-w-0 overflow-hidden rounded-[16px] border border-plum/10 bg-white p-5">
          <p className="text-xs font-medium text-plum/50">This week</p>
          <p className="mt-1 break-words text-2xl font-extrabold text-plum">{money(reports.sales.week)}</p>
        </div>
        <div className="min-w-0 overflow-hidden rounded-[16px] bg-plum p-5 text-white">
          <p className="text-xs font-medium text-white/70">{selectedLabel}</p>
          <p className="mt-1 break-words text-2xl font-extrabold text-white">{money(reports.sales.month)}</p>
          <p className="mt-1 text-xs text-pale-sage">Recorded sales + successful payments</p>
        </div>
      </div>

      <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="min-w-0 overflow-hidden rounded-[16px] bg-pale-sage p-5">
          <p className="text-xs font-medium text-plum/60">Current outstanding</p>
          <p className="mt-1 break-words text-2xl font-extrabold text-plum">{money(reports.outstanding.total)}</p>
          <p className="mt-1 text-xs text-plum/50">{reports.outstanding.byCustomer.length} customers owe you</p>
        </div>
        <div className="min-w-0 overflow-hidden rounded-[16px] border border-plum/10 bg-white p-5">
          <p className="text-xs font-medium text-plum/50">Expenses · {selectedLabel}</p>
          <p className="mt-1 break-words text-2xl font-extrabold text-plum">{money(reports.expenses.total)}</p>
        </div>
        <div className="min-w-0 overflow-hidden rounded-[16px] bg-plum p-5 text-white">
          <p className="text-xs font-medium text-white/70">Net · {selectedLabel}</p>
          <p className="mt-1 break-words text-2xl font-extrabold text-white">{money(reports.net)}</p>
          <p className="mt-1 text-xs text-pale-sage">Not tax/accounting advice</p>
        </div>
      </div>

      <div className="grid w-full min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="min-w-0 overflow-hidden rounded-[16px] border border-plum/10 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-sm font-bold text-plum">Payments by method</h2>
            <span className="text-[11px] font-semibold text-plum/40">{selectedLabel}</span>
          </div>
          {reports.paymentsByMethod.length === 0 ? (
            <p className="mt-2 text-sm text-plum/50">No successful payments in {selectedLabel}.</p>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {reports.paymentsByMethod.map((p) => (
                <div key={p.method} className="flex justify-between gap-2 overflow-hidden rounded-[12px] border border-plum/10 px-4 py-2.5">
                  <span className="min-w-0 truncate text-sm text-plum">{p.method.replaceAll("_", " ")} • {p.count}</span>
                  <span className="shrink-0 text-sm font-semibold text-plum">{money(p.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0 overflow-hidden rounded-[16px] border border-plum/10 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-sm font-bold text-plum">Expenses by category</h2>
            <span className="text-[11px] font-semibold text-plum/40">{selectedLabel}</span>
          </div>
          {reports.expenses.byCategory.length === 0 ? (
            <p className="mt-2 text-sm text-plum/50">No expenses in {selectedLabel}.</p>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {reports.expenses.byCategory.map((e) => (
                <div key={e.category} className="flex justify-between gap-2 overflow-hidden rounded-[12px] border border-plum/10 px-4 py-2.5">
                  <span className="min-w-0 truncate text-sm text-plum">{e.category}</span>
                  <span className="shrink-0 text-sm font-semibold text-plum">{money(e.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-[16px] border border-plum/10 bg-white p-6">
        <h2 className="font-heading text-sm font-bold text-plum">Outstanding by customer</h2>
        {reports.outstanding.byCustomer.length === 0 ? (
          <p className="mt-2 text-sm text-plum/50">All caught up — no outstanding.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {reports.outstanding.byCustomer.map((c) => (
              <div key={c.id} className="flex justify-between gap-2 overflow-hidden rounded-[12px] border border-plum/10 px-4 py-2.5">
                <span className="min-w-0 truncate text-sm text-plum">{c.name} • {c.phone}</span>
                <span className="shrink-0 text-sm font-semibold text-terracotta">{money(c.outstanding)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="min-w-0 overflow-hidden rounded-[16px] border border-plum/10 bg-white p-6">
        <h2 className="font-heading text-sm font-bold text-plum">Unpaid / overdue invoices</h2>
        {reports.outstanding.byInvoice.length === 0 ? (
          <p className="mt-2 text-sm text-plum/50">No outstanding invoices.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {reports.outstanding.byInvoice.map((inv) => (
              <div key={inv.id} className="flex justify-between gap-2 overflow-hidden rounded-[12px] border border-plum/10 px-4 py-2.5">
                <span className="min-w-0 truncate text-sm text-plum">{inv.invoiceNumber} • {inv.customer.name} • {inv.status}</span>
                <span className="shrink-0 text-sm font-semibold text-plum">{money(inv.outstanding)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
