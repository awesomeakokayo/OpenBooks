import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { StatusBadge } from "@/components/ui/StatusBadge";

const PAGE_SIZE = 25;

type PaymentsPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as unknown as { id: string }).id;
  const member = await prisma.businessMember.findFirst({ where: { userId }, include: { business: true } });
  if (!member) redirect("/create-business");

  const params = await searchParams;
  const parsedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const businessId = member.business.id;

  const [payments, totalCount] = await Promise.all([
    prisma.payment.findMany({
      where: { businessId },
      include: { customer: true, invoice: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.payment.count({ where: { businessId } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  return (
    <div className="mx-auto max-w-[1200px] flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-plum">Payments</h1>
        <p className="text-sm text-plum/60">{totalCount} recorded payments</p>
      </div>

      {payments.length === 0 ? (
        <div className="rounded-[16px] bg-pale-sage p-12 text-center">
          <p className="font-heading font-bold text-plum">No payments yet</p>
          <p className="mt-1 text-sm text-plum/60">Record a payment from an invoice or customer profile.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-4 rounded-[16px] border border-plum/10 bg-white px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-plum">{p.customer.name} • {p.method}</p>
                  <p className="mt-1 text-xs text-plum/50">
                    {new Date(p.createdAt).toLocaleDateString("en-NG")} {p.invoice ? `• ${p.invoice.invoiceNumber}` : "• no invoice"} • {p.verificationType}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-bold text-plum">₦{Number(p.amount).toLocaleString("en-NG")}</span>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            {safePage > 1 ? (
              <a href={`/payments?page=${safePage - 1}`} className="inline-flex h-10 items-center rounded-xl border border-plum/10 bg-white px-4 text-sm font-semibold text-plum hover:bg-pale-sage">
                Previous
              </a>
            ) : null}
            <span className="text-xs font-semibold text-plum/50">Page {safePage} of {totalPages}</span>
            {safePage < totalPages ? (
              <a href={`/payments?page=${safePage + 1}`} className="inline-flex h-10 items-center rounded-xl border border-plum/10 bg-white px-4 text-sm font-semibold text-plum hover:bg-pale-sage">
                Next
              </a>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
