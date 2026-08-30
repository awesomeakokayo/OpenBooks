import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getReports } from "@/lib/reports/reports";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as unknown as { id: string }).id;
  const member = await prisma.businessMember.findFirst({ where: { userId }, include: { business: true } });
  if (!member) redirect("/create-business");
  const businessId = member.business.id;
  const reports = await getReports(businessId);

  return (
    <div className="mx-auto max-w-[1200px] flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-plum">Reports</h1>
        <p className="text-sm text-plum/60">{member.business.name} • Sales − Expenses = Net</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[16px] border border-plum/10 bg-white p-5">
          <p className="text-xs font-medium text-plum/50">Sales today</p>
          <p className="mt-1 text-2xl font-extrabold text-plum">₦{reports.sales.today.toLocaleString("en-NG")}</p>
        </div>
        <div className="rounded-[16px] border border-plum/10 bg-white p-5">
          <p className="text-xs font-medium text-plum/50">This week</p>
          <p className="mt-1 text-2xl font-extrabold text-plum">₦{reports.sales.week.toLocaleString("en-NG")}</p>
        </div>
        <div className="rounded-[16px] border border-plum/10 bg-white p-5">
          <p className="text-xs font-medium text-plum/50">This month</p>
          <p className="mt-1 text-2xl font-extrabold text-plum">₦{reports.sales.month.toLocaleString("en-NG")}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[16px] bg-pale-sage p-5">
          <p className="text-xs font-medium text-plum/60">Outstanding</p>
          <p className="mt-1 text-2xl font-extrabold text-plum">₦{reports.outstanding.total.toLocaleString("en-NG")}</p>
          <p className="mt-1 text-xs text-plum/50">{reports.outstanding.byCustomer.length} customers owe you</p>
        </div>
        <div className="rounded-[16px] border border-plum/10 bg-white p-5">
          <p className="text-xs font-medium text-plum/50">Total expenses</p>
          <p className="mt-1 text-2xl font-extrabold text-plum">₦{reports.expenses.total.toLocaleString("en-NG")}</p>
        </div>
        <div className="rounded-[16px] bg-plum p-5 text-white">
          <p className="text-xs font-medium text-white/70">Net (Sales − Expenses)</p>
          <p className="mt-1 text-2xl font-extrabold text-white">₦{reports.net.toLocaleString("en-NG")}</p>
          <p className="mt-1 text-xs text-pale-sage">Not tax/accounting advice</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[16px] border border-plum/10 bg-white p-6">
          <h2 className="font-heading text-sm font-bold text-plum">Payments by method</h2>
          {reports.paymentsByMethod.length === 0 ? (
            <p className="mt-2 text-sm text-plum/50">No payments yet.</p>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {reports.paymentsByMethod.map((p) => (
                <div key={p.method} className="flex justify-between rounded-[12px] border border-plum/10 px-4 py-2.5">
                  <span className="text-sm text-plum">{p.method.replaceAll("_", " ")} • {p.count}</span>
                  <span className="text-sm font-semibold text-plum">₦{p.amount.toLocaleString("en-NG")}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[16px] border border-plum/10 bg-white p-6">
          <h2 className="font-heading text-sm font-bold text-plum">Expenses by category</h2>
          {reports.expenses.byCategory.length === 0 ? (
            <p className="mt-2 text-sm text-plum/50">No expenses yet.</p>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {reports.expenses.byCategory.map((e) => (
                <div key={e.category} className="flex justify-between rounded-[12px] border border-plum/10 px-4 py-2.5">
                  <span className="text-sm text-plum">{e.category}</span>
                  <span className="text-sm font-semibold text-plum">₦{e.amount.toLocaleString("en-NG")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[16px] border border-plum/10 bg-white p-6">
        <h2 className="font-heading text-sm font-bold text-plum">Outstanding by customer</h2>
        {reports.outstanding.byCustomer.length === 0 ? (
          <p className="mt-2 text-sm text-plum/50">All caught up — no outstanding.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {reports.outstanding.byCustomer.map((c) => (
              <div key={c.id} className="flex justify-between rounded-[12px] border border-plum/10 px-4 py-2.5">
                <span className="text-sm text-plum">{c.name} • {c.phone}</span>
                <span className="text-sm font-semibold text-terracotta">₦{c.outstanding.toLocaleString("en-NG")}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[16px] border border-plum/10 bg-white p-6">
        <h2 className="font-heading text-sm font-bold text-plum">Unpaid / overdue invoices</h2>
        {reports.outstanding.byInvoice.length === 0 ? (
          <p className="mt-2 text-sm text-plum/50">No outstanding invoices.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {reports.outstanding.byInvoice.map((inv) => (
              <div key={inv.id} className="flex justify-between rounded-[12px] border border-plum/10 px-4 py-2.5">
                <span className="text-sm text-plum">{inv.invoiceNumber} • {inv.customer.name} • {inv.status}</span>
                <span className="text-sm font-semibold text-plum">₦{inv.outstanding.toLocaleString("en-NG")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
