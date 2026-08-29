import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowUpRight, Mail, Phone, Plus, Users } from "lucide-react";
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
      ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { phone: { contains: search, mode: "insensitive" } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="openbooks-eyebrow text-terracotta">People</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-plum">Customers</h1>
          <p className="mt-1.5 text-sm text-plum/55">{customers.length} customer{customers.length !== 1 ? "s" : ""} in your business records.</p>
        </div>
        <Link href="/customers/new" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-plum px-5 text-sm font-bold !text-white shadow-[0_10px_28px_rgba(80,48,71,0.14)] hover:bg-plum-deep sm:h-11 sm:w-auto">
          <Plus size={17} className="text-white" /> Add customer
        </Link>
      </section>

      <CustomersClient businessId={businessId} initialSearch={search || ""} />

      {customers.length === 0 && !search ? (
        <div className="rounded-3xl bg-pale-sage p-10 text-center sm:p-14">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/75 text-plum shadow-sm"><Users size={23} /></span>
          <h2 className="mt-5 font-heading text-lg font-extrabold">No customers yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-plum/55">Add your first customer and OpenBooks will keep their contact details, invoices and payment history together.</p>
          <Link href="/customers/new" className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-plum px-5 text-sm font-bold !text-white hover:bg-plum-deep sm:h-11 sm:w-auto"><Plus size={16} className="text-white" /> Add customer</Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-plum/10 bg-white shadow-[0_12px_32px_rgba(80,48,71,0.05)]">
          <div className="hidden grid-cols-[1.3fr_1fr_1fr_72px] gap-4 border-b border-plum/10 bg-[#F8F8F6] px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-plum/40 sm:grid">
            <span>Customer</span><span>Phone</span><span>Email</span><span />
          </div>
          <div className="divide-y divide-plum/10">
            {customers.map((c) => (
              <Link key={c.id} href={`/customers/${c.id}`} className="group grid gap-3 px-5 py-4 transition hover:bg-[#F8F8F6] sm:grid-cols-[1.3fr_1fr_1fr_72px] sm:items-center sm:gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pale-sage text-xs font-extrabold text-plum">{c.name[0]?.toUpperCase() ?? "C"}</div>
                  <div className="min-w-0"><p className="truncate text-sm font-bold text-plum">{c.name}</p><p className="mt-0.5 text-xs text-plum/40 sm:hidden">Customer record</p></div>
                </div>
                <div className="flex min-w-0 items-center gap-2 text-xs text-plum/55 sm:text-sm"><Phone size={14} className="shrink-0 text-plum/35" /><span className="truncate">{c.phone || "No phone"}</span></div>
                <div className="flex min-w-0 items-center gap-2 text-xs text-plum/55 sm:text-sm"><Mail size={14} className="shrink-0 text-plum/35" /><span className="truncate">{c.email || "No email"}</span></div>
                <span className="hidden items-center justify-end text-terracotta sm:flex"><ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
