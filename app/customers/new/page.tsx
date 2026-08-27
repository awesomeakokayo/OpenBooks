import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { CustomerForm } from "@/components/customers/CustomerForm";
import Link from "next/link";

export default async function NewCustomerPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as unknown as { id: string }).id;
  const member = await prisma.businessMember.findFirst({ where: { userId }, include: { business: true } });
  if (!member) redirect("/create-business");

  return (
    <div className="mx-auto max-w-[640px] flex flex-col gap-6">
      <Link href="/customers" className="text-sm text-plum/60 hover:text-plum">
        ← Back to customers
      </Link>
      <div>
        <h1 className="font-heading text-2xl font-bold text-plum">Add customer</h1>
        <p className="mt-1 text-sm text-plum/60">Customers belong to {member.business.name}. You can edit later.</p>
      </div>
      <div className="rounded-[16px] border border-plum/10 bg-white p-6 shadow-[0_4px_20px_rgba(80,48,71,0.06)]">
        <CustomerForm businessId={member.business.id} />
      </div>
    </div>
  );
}
