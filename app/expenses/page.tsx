import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";

export default async function ExpensesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as unknown as { id: string }).id;
  const member = await prisma.businessMember.findFirst({ where: { userId }, include: { business: true } });
  if (!member) redirect("/create-business");
  const businessId = member.business.id;

  const expenses = await prisma.expense.findMany({ where: { businessId }, orderBy: { expenseDate: "desc" }, take: 50 });
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="mx-auto max-w-[1200px] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-plum">Expenses</h1>
          <p className="text-sm text-plum/60">{expenses.length} records • Total ₦{total.toLocaleString("en-NG")}</p>
        </div>
        <Link href="/expenses/new" className="inline-flex h-11 items-center justify-center rounded-[12px] bg-plum px-6 text-sm font-semibold text-white hover:bg-plum/90">
          + Record Expense
        </Link>
      </div>

      {expenses.length === 0 ? (
        <div className="rounded-[16px] bg-pale-sage p-12 text-center">
          <p className="font-heading font-bold text-plum">No expenses yet</p>
          <p className="mt-1 text-sm text-plum/60">Record transport, data, materials…</p>
          <Link href="/expenses/new" className="mt-4 inline-flex h-11 items-center justify-center rounded-[12px] bg-plum px-6 text-sm font-semibold text-white">
            Record Expense
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {expenses.map((ex) => (
            <div key={ex.id} className="flex items-center justify-between rounded-[16px] border border-plum/10 bg-white px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-plum">{ex.category} • {ex.description || "No description"}</p>
                <p className="text-xs text-plum/50">{new Date(ex.expenseDate).toLocaleDateString("en-NG")} {ex.paymentMethod ? `• ${ex.paymentMethod}` : ""}</p>
              </div>
              <span className="text-sm font-bold text-plum">₦{Number(ex.amount).toLocaleString("en-NG")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
