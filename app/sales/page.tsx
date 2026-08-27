import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";

export default async function SalesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as unknown as { id: string }).id;
  const member = await prisma.businessMember.findFirst({ where: { userId }, include: { business: true } });
  if (!member) redirect("/create-business");
  const businessId = member.business.id;

  const sales = await prisma.sale.findMany({
    where: { businessId },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-[1200px] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-plum">Sales</h1>
          <p className="text-sm text-plum/60">{sales.length} transactions</p>
        </div>
        <Link href="/sales/new" className="inline-flex h-11 items-center justify-center rounded-[12px] bg-terracotta px-6 text-sm font-semibold text-white hover:bg-terracotta/90">
          + Record Sale
        </Link>
      </div>

      {sales.length === 0 ? (
        <div className="rounded-[16px] bg-pale-sage p-12 text-center">
          <p className="font-heading font-bold text-plum">No sales yet</p>
          <p className="mt-1 text-sm text-plum/60">Record your first sale in seconds.</p>
          <Link href="/sales/new" className="mt-4 inline-flex h-11 items-center justify-center rounded-[12px] bg-plum px-6 text-sm font-semibold text-white">
            Record Sale
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sales.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-[16px] border border-plum/10 bg-white px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-plum">{s.description}</p>
                <p className="text-xs text-plum/50">
                  {s.customer?.name ?? "Walk-in"} • {s.paymentMethod || "Unpaid"} • {new Date(s.saleDate).toLocaleDateString("en-NG")}
                </p>
              </div>
              <p className="text-sm font-bold text-plum">₦{Number(s.totalAmount).toLocaleString("en-NG")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
