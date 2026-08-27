import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import Link from "next/link";

export default async function NewInvoicePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as unknown as { id: string }).id;
  const member = await prisma.businessMember.findFirst({ where: { userId }, include: { business: true } });
  if (!member) redirect("/create-business");
  const businessId = member.business.id;

  const customers = await prisma.customer.findMany({ where: { businessId }, orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div className="mx-auto max-w-[640px] flex flex-col gap-6">
      <Link href="/invoices" className="text-sm text-plum/60 hover:text-plum">
        ← Back to invoices
      </Link>
      <div>
        <h1 className="font-heading text-2xl font-bold text-plum">Create invoice</h1>
        <p className="mt-1 text-sm text-plum/60">Add items, choose payment methods, share via WhatsApp.</p>
      </div>
      <div className="rounded-[16px] border border-plum/10 bg-white p-6 shadow-[0_4px_20px_rgba(80,48,71,0.06)]">
        <InvoiceForm businessId={businessId} customers={customers} />
      </div>
    </div>
  );
}
