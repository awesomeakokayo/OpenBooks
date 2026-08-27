import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function PaymentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as unknown as { id: string }).id;
  const member = await prisma.businessMember.findFirst({ where: { userId }, include: { business: true } });
  if (!member) redirect("/create-business");

  const payments = await prisma.payment.findMany({
    where: { businessId: member.business.id },
    include: { customer: true, invoice: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-[1200px] flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-plum">Payments</h1>
        <p className="text-sm text-plum/60">{payments.length} records • manual + auto in Phase 6</p>
      </div>

      {payments.length === 0 ? (
        <div className="rounded-[16px] bg-pale-sage p-12 text-center">
          <p className="font-heading font-bold text-plum">No payments yet</p>
          <p className="mt-1 text-sm text-plum/60">Record a payment from an invoice or customer profile.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-[16px] border border-plum/10 bg-white px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-plum">{p.customer.name} • {p.method} • {p.provider}</p>
                <p className="text-xs text-plum/50">{new Date(p.createdAt).toLocaleDateString("en-NG")} {p.invoice ? `• ${p.invoice.invoiceNumber}` : "• no invoice"} • {p.verificationType}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-plum">₦{Number(p.amount).toLocaleString("en-NG")}</span>
                <StatusBadge status={p.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
