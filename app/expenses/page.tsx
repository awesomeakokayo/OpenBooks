import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";

const PAGE_SIZE = 25;

type ExpensesPageProps = { searchParams: Promise<{ page?: string }> };

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/login");
  const member = await prisma.businessMember.findFirst({ where: { userId }, include: { business: true } });
  if (!member) redirect("/create-business");
  const businessId = member.business.id;
  const params = await searchParams;
  const rawPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const [expenses, totalCount, totalAgg] = await Promise.all([
    prisma.expense.findMany({ where: { businessId }, orderBy: [{ expenseDate: "desc" }, { id: "desc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.expense.count({ where: { businessId } }),
    prisma.expense.aggregate({ where: { businessId }, _sum: { amount: true } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const total = Number(totalAgg._sum.amount ?? 0);

  return (
    <div className="mx-auto max-w-[1200px] flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="font-heading text-2xl font-bold text-plum">Expenses</h1><p className="text-sm text-plum/60">{totalCount} records • Total ₦{total.toLocaleString("en-NG")}</p></div>
        <Link href="/expenses/new" className="inline-flex h-11 w-full items-center justify-center rounded-[12px] bg-plum px-6 text-sm font-semibold text-white hover:bg-plum/90 sm:w-auto">+ Record Expense</Link>
      </div>

      {expenses.length === 0 ? (
        <div className="rounded-[16px] bg-pale-sage p-12 text-center"><p className="font-heading font-bold text-plum">No expenses yet</p><p className="mt-1 text-sm text-plum/60">Record transport, data, materials…</p><Link href="/expenses/new" className="mt-4 inline-flex h-11 items-center justify-center rounded-[12px] bg-plum px-6 text-sm font-semibold text-white">Record Expense</Link></div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {expenses.map((ex) => <div key={ex.id} className="flex items-center justify-between gap-4 rounded-[16px] border border-plum/10 bg-white px-5 py-4"><div className="min-w-0"><p className="truncate text-sm font-semibold text-plum">{ex.category} • {ex.description || "No description"}</p><p className="text-xs text-plum/50">{new Date(ex.expenseDate).toLocaleDateString("en-NG")} {ex.paymentMethod ? `• ${ex.paymentMethod.replaceAll("_", " ")}` : ""}</p></div><span className="shrink-0 text-sm font-bold text-plum">₦{Number(ex.amount).toLocaleString("en-NG")}</span></div>)}
          </div>
          <div className="flex items-center justify-center gap-3 pt-1">
            {safePage > 1 ? <Link href={`/expenses?page=${safePage - 1}`} className="inline-flex h-10 items-center rounded-xl border border-plum/10 bg-white px-4 text-sm font-semibold text-plum hover:bg-pale-sage">Previous</Link> : null}
            <span className="text-xs font-semibold text-plum/50">Page {safePage} of {totalPages}</span>
            {safePage < totalPages ? <Link href={`/expenses?page=${safePage + 1}`} className="inline-flex h-10 items-center rounded-xl border border-plum/10 bg-white px-4 text-sm font-semibold text-plum hover:bg-pale-sage">Next</Link> : null}
          </div>
        </>
      )}
    </div>
  );
}
