import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { SaleForm } from "@/components/sales/SaleForm";
import Link from "next/link";

export default async function NewSalePage({ searchParams }: { searchParams: Promise<{ customerId?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as unknown as { id: string }).id;
  const member = await prisma.businessMember.findFirst({ where: { userId }, include: { business: true } });
  if (!member) redirect("/create-business");
  const businessId = member.business.id;

  const customers = await prisma.customer.findMany({ where: { businessId }, orderBy: { name: "asc" }, select: { id: true, name: true } });
  const { customerId } = await searchParams;

  return (
    <div className="mx-auto max-w-[640px] flex flex-col gap-6">
      <Link href="/sales" className="text-sm text-plum/60 hover:text-plum">
        ← Back to sales
      </Link>
      <div>
        <h1 className="font-heading text-2xl font-bold text-plum">Record sale</h1>
        <p className="mt-1 text-sm text-plum/60">A quick transaction — you can always create an invoice later.</p>
      </div>
      <div className="rounded-[16px] border border-plum/10 bg-white p-6 shadow-[0_4px_20px_rgba(80,48,71,0.06)]">
        <SaleForm businessId={businessId} customers={customers} preselectedCustomerId={customerId} />
      </div>
    </div>
  );
}
