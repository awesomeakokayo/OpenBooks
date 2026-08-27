import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { calculateCustomerOutstanding } from "@/lib/customers/service";
import Link from "next/link";

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as unknown as { id: string }).id;
  const member = await prisma.businessMember.findFirst({ where: { userId }, include: { business: true } });
  if (!member) redirect("/create-business");
  const businessId = member.business.id;

  const customer = await prisma.customer.findFirst({
    where: { id, businessId },
    include: {
      sales: { orderBy: { createdAt: "desc" }, take: 10 },
      invoices: { orderBy: { createdAt: "desc" }, take: 10 },
      payments: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!customer) notFound();

  const stats = await calculateCustomerOutstanding(businessId, id);
  const totalSalesAgg = await prisma.sale.aggregate({ where: { businessId, customerId: id }, _sum: { totalAmount: true } });
  const totalSales = Number(totalSalesAgg._sum.totalAmount ?? 0);

  return (
    <div className="mx-auto max-w-[900px] flex flex-col gap-6">
      <Link href="/customers" className="text-sm text-plum/60 hover:text-plum">
        ← Back to customers
      </Link>

      <div className="rounded-[16px] border border-plum/10 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pale-sage text-sm font-bold text-plum">
            {customer.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-plum">{customer.name}</h1>
            <p className="text-sm text-plum/60">{customer.phone} {customer.email ? `• ${customer.email}` : ""}</p>
            {customer.notes && <p className="mt-1 text-xs text-plum/50">{customer.notes}</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[16px] border border-plum/10 bg-white p-5">
          <p className="text-xs font-medium text-plum/50">Total sales</p>
          <p className="mt-1 text-xl font-bold text-plum">₦{totalSales.toLocaleString("en-NG")}</p>
        </div>
        <div className="rounded-[16px] border border-plum/10 bg-white p-5">
          <p className="text-xs font-medium text-plum/50">Total paid (invoices)</p>
          <p className="mt-1 text-xl font-bold text-plum">₦{stats.totalPaid.toLocaleString("en-NG")}</p>
        </div>
        <div className="rounded-[16px] bg-pale-sage p-5">
          <p className="text-xs font-medium text-plum/60">Outstanding</p>
          <p className="mt-1 text-xl font-bold text-plum">₦{stats.outstanding.toLocaleString("en-NG")}</p>
          <p className="mt-1 text-xs text-plum/50">Derived from invoices − payments</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[16px] border border-plum/10 bg-white p-6">
          <h2 className="font-heading text-sm font-bold text-plum">Recent sales</h2>
          {customer.sales.length === 0 ? (
            <p className="mt-2 text-sm text-plum/50">No sales recorded.</p>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {customer.sales.map((s) => (
                <div key={s.id} className="flex justify-between rounded-[12px] border border-plum/10 px-4 py-2.5">
                  <span className="text-sm text-plum">{s.description}</span>
                  <span className="text-sm font-semibold text-plum">₦{Number(s.totalAmount).toLocaleString("en-NG")}</span>
                </div>
              ))}
            </div>
          )}
          <Link href={`/sales?customerId=${customer.id}`} className="mt-3 inline-block text-xs font-semibold text-terracotta">
            Record sale →
          </Link>
        </div>

        <div className="rounded-[16px] border border-plum/10 bg-white p-6">
          <h2 className="font-heading text-sm font-bold text-plum">Invoices</h2>
          {customer.invoices.length === 0 ? (
            <p className="mt-2 text-sm text-plum/50">No invoices.</p>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {customer.invoices.map((inv) => (
                <div key={inv.id} className="flex justify-between rounded-[12px] border border-plum/10 px-4 py-2.5">
                  <span className="text-sm text-plum">{inv.invoiceNumber} • {inv.status}</span>
                  <span className="text-sm font-semibold text-plum">₦{Number(inv.total).toLocaleString("en-NG")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[16px] border border-plum/10 bg-white p-6">
        <h2 className="font-heading text-sm font-bold text-plum">Payments</h2>
        {customer.payments.length === 0 ? (
          <p className="mt-2 text-sm text-plum/50">No payments.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {customer.payments.map((p) => (
              <div key={p.id} className="flex justify-between rounded-[12px] border border-plum/10 px-4 py-2.5">
                <span className="text-sm text-plum">{p.method} • {p.status}</span>
                <span className="text-sm font-semibold text-plum">₦{Number(p.amount).toLocaleString("en-NG")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
