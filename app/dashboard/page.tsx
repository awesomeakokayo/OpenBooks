import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { getDashboardMetrics } from "@/lib/reports/metrics";
import { getBusinessMonthOptions } from "@/lib/reports/months";
import { MonthSelector } from "@/components/reports/MonthSelector";
import {
  ArrowRight,
  ArrowUpRight,
  CircleDollarSign,
  FileText,
  Plus,
  ReceiptText,
  Users,
  WalletCards,
} from "lucide-react";

type DashboardPageProps = {
  searchParams: Promise<{ month?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as unknown as { id: string }).id;
  const member = await prisma.businessMember.findFirst({ where: { userId }, include: { business: true } });
  if (!member) redirect("/create-business");

  const business = member.business;
  const params = await searchParams;
  const months = await getBusinessMonthOptions(business.id);
  const selectedMonth = params.month && months.includes(params.month) ? params.month : months[0];
  const metrics = await getDashboardMetrics(business.id, selectedMonth);
  const name = session.user?.name?.split(" ")[0] ?? "there";
  const money = (value: number) => `₦${Number(value ?? 0).toLocaleString("en-NG")}`;
  const monthLabels = Object.fromEntries(months.map((month) => [month, new Intl.DateTimeFormat("en-NG", { month: "long", year: "numeric", timeZone: "Africa/Lagos" }).format(new Date(`${month}-15T12:00:00`))]));
  const selectedLabel = monthLabels[selectedMonth];
  const previousMonth = months[months.indexOf(selectedMonth) + 1];

  const metricsCards = [
    { label: metrics.isCurrentMonth ? "Sales this month" : `Sales in ${selectedLabel}`, value: money(metrics.monthSales), detail: "Money received or recorded", icon: WalletCards, tone: "bg-plum text-white", detailClass: "text-white/80" },
    { label: "Customers owe you", value: money(metrics.outstanding), detail: "Current outstanding invoice balance", icon: CircleDollarSign, tone: "bg-pale-sage text-plum", detailClass: "text-plum/55" },
    { label: "Customers", value: String(metrics.customerCount), detail: "People you do business with", icon: Users, tone: "bg-white text-plum border border-plum/10", detailClass: "text-plum/50" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="openbooks-eyebrow text-terracotta">{business.name}</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-plum sm:text-4xl">Good morning, {name}.</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-plum/55">Here’s the state of your business today. Keep the numbers clear and the next action obvious.</p>
        </div>
        <Link href="/invoices" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-terracotta px-5 text-sm font-bold text-white shadow-[0_10px_28px_rgba(192,87,70,0.2)] transition-all hover:-translate-y-px hover:bg-terracotta-dark">
          <Plus size={17} /> Create invoice
        </Link>
      </section>

      <section className="grid w-full gap-4 md:grid-cols-3">
        {metricsCards.map(({ label, value, detail, icon: Icon, tone, detailClass }) => (
          <div key={label} className={`w-full rounded-3xl p-6 shadow-[0_12px_32px_rgba(80,48,71,0.05)] ${tone}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] opacity-60">{label}</p>
                <p className="mt-3 font-heading text-3xl font-extrabold tracking-tight">{value}</p>
                <p className={`mt-2 text-xs font-semibold ${detailClass}`}>{detail}</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5">
                <Icon size={18} strokeWidth={2} />
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-plum/10 bg-white p-4 sm:flex-row sm:items-center sm:px-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-plum/40">Reporting period</p>
          <p className="mt-1 text-sm font-semibold text-plum">Review sales, expenses and activity for a specific month.</p>
        </div>
        <MonthSelector basePath="/dashboard" selectedMonth={selectedMonth} months={months} labels={monthLabels} />
      </section>

      {!metrics.isCurrentMonth && metrics.monthSales === 0 && previousMonth ? (
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-plum/10 bg-pale-sage px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-plum">No sales recorded in {selectedLabel}.</p>
            <p className="mt-1 text-xs text-plum/55">Try the previous month to compare your recent activity.</p>
          </div>
          <Link href={`/dashboard?month=${previousMonth}`} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-plum px-4 text-xs font-bold text-white hover:bg-plum-deep">View {monthLabels[previousMonth]} <ArrowRight size={14} /></Link>
        </div>
      ) : metrics.isCurrentMonth && metrics.monthSales === 0 && previousMonth ? (
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-plum/10 bg-pale-sage px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-plum">No sales recorded in {selectedLabel} yet.</p>
            <p className="mt-1 text-xs text-plum/55">You can still review your previous month’s numbers.</p>
          </div>
          <Link href={`/dashboard?month=${previousMonth}`} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-plum px-4 text-xs font-bold text-white hover:bg-plum-deep">View {monthLabels[previousMonth]} <ArrowRight size={14} /></Link>
        </div>
      ) : null}

      <section className="grid w-full justify-items-stretch gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="openbooks-card mx-auto w-full max-w-full p-6 sm:p-7">
          <div className="flex items-end justify-between gap-4 border-b border-plum/10 pb-5">
            <div>
              <p className="openbooks-eyebrow text-plum/40">Activity · {selectedLabel}</p>
              <h2 className="mt-2 font-heading text-xl font-extrabold">Activity in this period</h2>
            </div>
            <Link href="/sales" className="inline-flex items-center gap-1 text-xs font-bold text-terracotta hover:text-terracotta-dark">View all <ArrowUpRight size={14} /></Link>
          </div>

          {metrics.recentSales.length === 0 ? (
            <div className="openbooks-card-soft mt-5 flex flex-col items-center px-5 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pale-sage text-plum"><ReceiptText size={20} /></span>
              <h3 className="mt-4 font-heading text-base font-extrabold">Nothing recorded in {selectedLabel}</h3>
              <p className="mt-1.5 max-w-sm text-sm leading-6 text-plum/50">Sales and successful payments for this month will appear here. Your broader history is always available in Sales.</p>
              <Link href="/sales/new" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-plum px-4 py-2.5 text-xs font-bold text-white hover:bg-plum-deep">Record a sale <ArrowRight size={14} /></Link>
            </div>
          ) : (
            <div className="mt-2 divide-y divide-plum/10">
              {metrics.recentSales.slice(0, 6).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pale-sage text-plum"><FileText size={16} /></span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-plum">{item.description}</p>
                      <p className="mt-0.5 truncate text-xs text-plum/45">{item.customerName}{item.type === "PAYMENT" ? ` · ${item.method?.replaceAll("_", " ") ?? ""}` : ""}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-extrabold text-plum">{money(item.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mx-auto w-full max-w-full rounded-3xl bg-plum p-6 text-white sm:p-7">
          <p className="openbooks-eyebrow text-pale-sage">{metrics.isCurrentMonth ? "This month" : selectedLabel}</p>
          <p className="mt-4 font-heading text-3xl font-extrabold tracking-tight">{money(metrics.monthSales)}</p>
          <div className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm">
            {metrics.isCurrentMonth ? <div className="flex items-center justify-between"><span className="text-white/55">Today</span><span className="font-bold">{money(metrics.todaySales)}</span></div> : null}
            <div className="flex items-center justify-between"><span className="text-white/55">Expenses</span><span className="font-bold">{money(metrics.monthExpenses)}</span></div>
            <div className="flex items-center justify-between"><span className="text-white/55">Invoices issued</span><span className="font-bold">{metrics.invoiceCount}</span></div>
          </div>
          <Link href={`/reports?month=${selectedMonth}`} className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-pale-sage hover:text-white">View {selectedLabel} report <ArrowRight size={14} /></Link>
        </div>
      </section>

      <section className="w-full">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="openbooks-eyebrow text-plum/40">Quick actions</p>
            <h2 className="mt-2 font-heading text-xl font-extrabold">Keep moving</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { href: "/customers/new", label: "Add customer", copy: "Save a customer and keep their history together.", icon: Users },
            { href: "/expenses", label: "Record expense", copy: "Capture what leaves the business before it gets forgotten.", icon: CircleDollarSign },
            { href: "/business/settings", label: "Payment settings", copy: "Choose how customers can pay you on invoices.", icon: WalletCards },
          ].map(({ href, label, copy, icon: Icon }) => (
            <Link key={href} href={href} className="group rounded-2xl border border-plum/10 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-plum/15 hover:shadow-[0_12px_32px_rgba(80,48,71,0.07)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pale-sage text-plum"><Icon size={18} /></span>
              <div className="mt-5 flex items-center justify-between gap-3">
                <h3 className="font-heading text-sm font-extrabold">{label}</h3>
                <ArrowRight size={16} className="text-plum/35 transition-transform group-hover:translate-x-0.5 group-hover:text-terracotta" />
              </div>
              <p className="mt-1.5 text-xs leading-5 text-plum/50">{copy}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
