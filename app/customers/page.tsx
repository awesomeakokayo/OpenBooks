import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { CustomersClient } from "./CustomersClient";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as unknown as { id: string }).id;
  const member = await prisma.businessMember.findFirst({ where: { userId }, include: { business: true } });
  if (!member) redirect("/create-business");
  const businessId = member.business.id;

  const { search } = await searchParams;
  const customers = await prisma.customer.findMany({
    where: {
      businessId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-[1200px] flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-plum">Customers</h1>
          <p className="text-sm text-plum/60">{customers.length} customer{customers.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href={`/customers/new`}
          className="inline-flex h-11 items-center justify-center rounded-[12px] bg-plum px-6 text-sm font-semibold text-white hover:bg-plum/90"
        >
          + Add Customer
        </Link>
      </div>

      <CustomersClient businessId={businessId} initialSearch={search || ""} />

      {customers.length === 0 && !search ? (
        <div className="rounded-[16px] bg-pale-sage p-12 text-center">
          <p className="font-heading font-bold text-plum">No customers yet</p>
          <p className="mt-1 text-sm text-plum/60">Add your first customer to start keeping track.</p>
          <Link
            href="/customers/new"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-[12px] bg-plum px-6 text-sm font-semibold text-white"
          >
            Add Customer
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {customers.map((c) => (
            <Link
              key={c.id}
              href={`/customers/${c.id}`}
              className="flex items-center justify-between rounded-[16px] border border-plum/10 bg-white px-5 py-4 hover:border-plum/20 hover:shadow-[0_4px_20px_rgba(80,48,71,0.06)]"
            >
              <div>
                <p className="text-sm font-semibold text-plum">{c.name}</p>
                <p className="text-xs text-plum/60">{c.phone} {c.email ? `• ${c.email}` : ""}</p>
              </div>
              <span className="text-xs font-semibold text-terracotta">View →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
