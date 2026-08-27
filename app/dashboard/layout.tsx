import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as unknown as { id: string }).id;
  // Ensure user has a business — otherwise redirect to create-business
  const member = userId
    ? await prisma.businessMember.findFirst({ where: { userId }, include: { business: true } })
    : null;
  if (!member) redirect("/create-business");

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="hidden w-[260px] shrink-0 border-r border-plum/10 bg-white lg:flex lg:flex-col print:hidden">
        <div className="flex h-16 items-center gap-2 border-b border-plum/10 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-plum text-sm font-bold text-white">
            OB
          </div>
          <span className="font-heading text-sm font-bold text-plum">OpenBooks NG</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4">
          <Link href="/dashboard" className="rounded-[12px] bg-pale-sage px-4 py-2.5 text-sm font-semibold text-plum">
            Dashboard
          </Link>
          <Link href="/customers" className="rounded-[12px] px-4 py-2.5 text-sm font-medium text-plum/70 hover:bg-pale-sage">
            Customers
          </Link>
          <Link href="/invoices" className="rounded-[12px] px-4 py-2.5 text-sm font-medium text-plum/70 hover:bg-pale-sage">
            Invoices
          </Link>
          <Link href="/sales" className="rounded-[12px] px-4 py-2.5 text-sm font-medium text-plum/70 hover:bg-pale-sage">
            Sales
          </Link>
          <Link href="/payments" className="rounded-[12px] px-4 py-2.5 text-sm font-medium text-plum/70 hover:bg-pale-sage">
            Payments
          </Link>
          <Link href="/receipts" className="rounded-[12px] px-4 py-2.5 text-sm font-medium text-plum/70 hover:bg-pale-sage">
            Receipts
          </Link>
          <Link href="/expenses" className="rounded-[12px] px-4 py-2.5 text-sm font-medium text-plum/70 hover:bg-pale-sage">
            Expenses
          </Link>
          <Link href="/business/settings" className="rounded-[12px] px-4 py-2.5 text-sm font-medium text-plum/70 hover:bg-pale-sage">
            Settings
          </Link>
        </nav>
        <div className="border-t border-plum/10 p-4">
          <p className="text-xs font-semibold text-plum">{member.business.name}</p>
          <p className="text-xs text-plum/50">{session.user?.email}</p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-plum/10 bg-white px-4 lg:px-8 print:hidden">
          <p className="font-heading text-sm font-bold text-plum lg:hidden">OpenBooks NG</p>
          <div className="hidden lg:block text-xs text-plum/50">{member.business.name} • NGN</div>
          <nav className="flex items-center gap-2 lg:hidden">
            <Link href="/dashboard" className="rounded-full bg-pale-sage px-3 py-1 text-xs font-semibold text-plum">
              Dashboard
            </Link>
            <Link href="/business/settings" className="text-xs text-plum/60">
              Settings
            </Link>
          </nav>
          <div className="hidden lg:block text-xs text-plum/40">Phase 5 — Receipts ready</div>
        </header>

        {/* Mobile nav */}
        <nav className="flex gap-2 overflow-x-auto border-b border-plum/10 bg-white px-4 py-3 lg:hidden print:hidden">
          <Link href="/dashboard" className="whitespace-nowrap rounded-full bg-plum px-4 py-2 text-xs font-semibold text-white">
            Dashboard
          </Link>
          <Link href="/customers" className="whitespace-nowrap rounded-full border border-plum/10 px-4 py-2 text-xs font-semibold text-plum">
            Customers
          </Link>
          <Link href="/invoices" className="whitespace-nowrap rounded-full border border-plum/10 px-4 py-2 text-xs font-semibold text-plum">
            Invoices
          </Link>
          <Link href="/payments" className="whitespace-nowrap rounded-full border border-plum/10 px-4 py-2 text-xs font-semibold text-plum">
            Payments
          </Link>
          <Link href="/expenses" className="whitespace-nowrap rounded-full border border-plum/10 px-4 py-2 text-xs font-semibold text-plum">
            Expenses
          </Link>
        </nav>

        <main className="flex-1 bg-white px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
