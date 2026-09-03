import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { MonthSelector } from "@/components/reports/MonthSelector";
import { formatMonthKey, getBusinessMonthOptions, getNigeriaMonthRange } from "@/lib/reports/months";

const PAGE_SIZE = 25;

type SalesPageProps = {
  searchParams: Promise<{ page?: string; month?: string }>;
};

export default async function SalesPage({ searchParams }: SalesPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as unknown as { id: string }).id;
  const member = await prisma.businessMember.findFirst({ where: { userId }, include: { business: true } });
  if (!member) redirect("/create-business");
  const businessId = member.business.id;

  const params = await searchParams;
  const parsedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const months = await getBusinessMonthOptions(businessId);
  const requestedMonth = params.month === "all" ? "all" : params.month;
  const selectedMonth = requestedMonth === "all" || (requestedMonth && months.includes(requestedMonth)) ? requestedMonth ?? "all" : "all";
  const monthLabels = Object.fromEntries(months.map((month) => [month, formatMonthKey(month)]));
  const isAllTime = selectedMonth === "all";
  const monthRange = isAllTime ? null : getNigeriaMonthRange(selectedMonth as string);
  const salesDateFilter = monthRange ? { saleDate: { gte: monthRange.start, lt: monthRange.end } } : {};
  const paymentDateFilter = monthRange ? { createdAt: { gte: monthRange.start, lt: monthRange.end } } : {};
  const fetchLimit = page * PAGE_SIZE + 1;

  const [sales, payments, salesCount, paymentsCount, totalSalesAgg, totalPaymentsAgg] = await Promise.all([
    prisma.sale.findMany({
      where: { businessId, ...salesDateFilter },
      include: { customer: true },
      orderBy: { saleDate: "desc" },
      take: fetchLimit,
    }),
    prisma.payment.findMany({
      where: { businessId, status: "SUCCESS", ...paymentDateFilter },
      include: { customer: true, invoice: true },
      orderBy: { createdAt: "desc" },
      take: fetchLimit,
    }),
    prisma.sale.count({ where: { businessId, ...salesDateFilter } }),
    prisma.payment.count({ where: { businessId, status: "SUCCESS", ...paymentDateFilter } }),
    prisma.sale.aggregate({ where: { businessId, ...salesDateFilter }, _sum: { totalAmount: true } }),
    prisma.payment.aggregate({ where: { businessId, status: "SUCCESS", ...paymentDateFilter }, _sum: { amount: true } }),
  ]);

  const allTransactions = [
    ...sales.map((sale) => ({
      id: `sale:${sale.id}`,
      date: sale.saleDate,
      description: sale.description,
      customer: sale.customer?.name ?? "Walk-in",
      method: sale.paymentMethod ?? "—",
      amount: Number(sale.totalAmount),
      type: "Sale",
    })),
    ...payments.map((payment) => ({
      id: `payment:${payment.id}`,
      date: payment.createdAt,
      description: payment.invoice?.invoiceNumber ? `Payment for ${payment.invoice.invoiceNumber}` : "Payment received",
      customer: payment.customer?.name ?? "Customer",
      method: payment.method,
      amount: Number(payment.amount),
      type: "Payment",
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const start = (page - 1) * PAGE_SIZE;
  const transactions = allTransactions.slice(start, start + PAGE_SIZE);
  const totalCount = salesCount + paymentsCount;
  const hasNextPage = page * PAGE_SIZE < totalCount;
  const total = Number(totalSalesAgg._sum.totalAmount ?? 0) + Number(totalPaymentsAgg._sum.amount ?? 0);
  const money = (value: number) => `₦${value.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const selectedLabel = isAllTime ? "All time" : monthLabels[selectedMonth as string];

  return (
    <div className="mx-auto flex w-full max-w-[1200px] min-w-0 flex-col gap-6 overflow-x-hidden">
      <div className="flex w-full min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <p className="openbooks-eyebrow text-terracotta">Financial activity</p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-plum">Sales</h1>
          <p className="mt-1 text-sm text-plum/60">{totalCount} recorded transactions · {selectedLabel}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <MonthSelector basePath="/sales" selectedMonth={selectedMonth} months={months} labels={monthLabels} allTime />
          <Link href="/sales/new" className="inline-flex h-11 items-center justify-center rounded-[12px] bg-terracotta px-6 text-sm font-semibold text-white hover:bg-terracotta/90">
            + Record Sale
          </Link>
        </div>
      </div>

      <div className="w-full min-w-0 overflow-hidden rounded-[16px] bg-pale-sage p-5 sm:p-6">
        <div className="flex w-full min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-plum/50">Money received or recorded</p>
            <p className="mt-2 break-words font-heading text-3xl font-extrabold text-plum">{money(total)}</p>
            <p className="mt-1 text-xs text-plum/50">
              {isAllTime ? "All time · includes recorded sales and successful payments against invoices." : `${selectedLabel} · includes recorded sales and successful payments against invoices.`}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-plum/10 bg-white/70 px-3 py-1.5 text-[11px] font-bold text-plum/55">{selectedLabel}</span>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="w-full min-w-0 overflow-hidden rounded-[16px] bg-pale-sage p-12 text-center">
          <p className="font-heading font-bold text-plum">No sales or payments in {selectedLabel}</p>
          <p className="mt-1 text-sm text-plum/60">Choose another month above or record a new sale.</p>
          <Link href="/sales/new" className="mt-4 inline-flex h-11 items-center justify-center rounded-[12px] bg-plum px-6 text-sm font-semibold text-white">
            Record Sale
          </Link>
        </div>
      ) : (
        <>
          <div className="flex w-full min-w-0 flex-col gap-2">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex w-full min-w-0 items-center justify-between gap-4 overflow-hidden rounded-[16px] border border-plum/10 bg-white px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-plum">{transaction.description}</p>
                  <p className="mt-1 truncate text-xs text-plum/50">
                    {transaction.customer} • {transaction.method.replaceAll("_", " ")} • {new Date(transaction.date).toLocaleDateString("en-NG")} • {transaction.type}
                  </p>
                </div>
                <p className="shrink-0 break-all text-sm font-bold text-plum">{money(transaction.amount)}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            {page > 1 ? (
              <Link href={`/sales?month=${encodeURIComponent(selectedMonth)}&page=${page - 1}`} className="inline-flex h-10 items-center rounded-xl border border-plum/10 bg-white px-4 text-sm font-semibold text-plum hover:bg-pale-sage">
                Previous
              </Link>
            ) : null}
            <span className="text-xs font-semibold text-plum/50">Page {page}</span>
            {hasNextPage ? (
              <Link href={`/sales?month=${encodeURIComponent(selectedMonth)}&page=${page + 1}`} className="inline-flex h-10 items-center rounded-xl border border-plum/10 bg-white px-4 text-sm font-semibold text-plum hover:bg-pale-sage">
                Next
              </Link>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
