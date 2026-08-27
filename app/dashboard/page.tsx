import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as unknown as { id: string }).id;
  const member = await prisma.businessMember.findFirst({
    where: { userId },
    include: { business: true },
  });
  if (!member) redirect("/create-business");
  const business = member.business;

  // Basic metrics (server aggregation, Phase 1 skeleton)
  const customerCount = await prisma.customer.count({ where: { businessId: business.id } });
  const invoiceCount = await prisma.invoice.count({ where: { businessId: business.id } });
  const paymentAgg = await prisma.payment.aggregate({
    where: { businessId: business.id, status: "SUCCESS" },
    _sum: { amount: true },
  });
  const expenseAgg = await prisma.expense.aggregate({
    where: { businessId: business.id },
    _sum: { amount: true },
  });

  const totalPaid = Number(paymentAgg._sum.amount ?? 0);
  const totalExpenses = Number(expenseAgg._sum.amount ?? 0);

  const name = session.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-[1200px] flex flex-col gap-8">
      {/* Greeting */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-plum">Good morning, {name} 👋</h1>
        <p className="mt-1 text-sm text-plum/60">{business.name} • Your business at a glance</p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-[16px] border border-plum/10 bg-white p-5 shadow-[0_4px_20px_rgba(80,48,71,0.06)]">
          <p className="text-xs font-medium text-plum/50">Sales this month</p>
          <p className="mt-2 text-3xl font-extrabold text-plum">₦{totalPaid.toLocaleString("en-NG")}</p>
          <p className="mt-1 text-xs text-sage font-semibold">From successful payments</p>
        </div>
        <div className="rounded-[16px] bg-pale-sage p-5">
          <p className="text-xs font-medium text-plum/60">Customers owe you</p>
          <p className="mt-2 text-3xl font-extrabold text-plum">—</p>
          <p className="mt-1 text-xs text-plum/50">Outstanding derived in Phase 2</p>
        </div>
        <div className="rounded-[16px] border border-plum/10 bg-white p-5 shadow-[0_4px_20px_rgba(80,48,71,0.06)]">
          <p className="text-xs font-medium text-plum/50">Customers</p>
          <p className="mt-2 text-3xl font-extrabold text-plum">{customerCount}</p>
          <Link href="/customers" className="mt-2 inline-block text-xs font-semibold text-terracotta hover:text-plum">
            View customers →
          </Link>
        </div>
      </div>

      {/* Expenses hint */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[16px] border border-plum/10 bg-white p-5">
          <p className="text-xs font-medium text-plum/50">Invoices</p>
          <p className="mt-1 text-xl font-bold text-plum">{invoiceCount}</p>
        </div>
        <div className="rounded-[16px] border border-plum/10 bg-white p-5">
          <p className="text-xs font-medium text-plum/50">Expenses</p>
          <p className="mt-1 text-xl font-bold text-plum">₦{totalExpenses.toLocaleString("en-NG")}</p>
        </div>
        <div className="rounded-[16px] bg-plum p-5 text-white">
          <p className="text-xs font-medium text-white/70">Phase 1</p>
          <p className="mt-1 text-sm font-semibold text-white">Business workspace ready</p>
          <p className="mt-1 text-xs text-pale-sage">Next: add customers & record sales</p>
        </div>
      </div>

      {/* Primary actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/invoices"
          className="inline-flex h-12 items-center justify-center rounded-[12px] bg-terracotta px-8 text-sm font-semibold text-white hover:bg-terracotta/90"
        >
          Create Invoice
        </Link>
        <Link
          href="/customers"
          className="inline-flex h-12 items-center justify-center rounded-[12px] bg-pale-sage px-8 text-sm font-semibold text-plum hover:bg-sage"
        >
          Add Customer
        </Link>
        <Link
          href="/business/settings"
          className="inline-flex h-12 items-center justify-center rounded-[12px] border border-plum/10 bg-white px-8 text-sm font-semibold text-plum hover:bg-pale-sage"
        >
          Payment Settings
        </Link>
      </div>

      {/* Recent activity placeholder */}
      <div className="rounded-[16px] border border-plum/10 bg-white p-6">
        <h2 className="font-heading text-sm font-bold text-plum">Recent activity</h2>
        <p className="mt-2 text-sm text-plum/50">
          No transactions yet. Create your first customer and record a sale to see activity here.
        </p>
      </div>
    </div>
  );
}
