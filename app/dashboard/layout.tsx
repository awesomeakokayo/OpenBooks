import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  CircleDollarSign,
  FileText,
  LayoutDashboard,
  ReceiptText,
  Settings,
  ShoppingBag,
  Store,
  Users,
  WalletCards,
} from "lucide-react";
import { OpenBooksBrandMark } from "@/components/openbooks-brand-mark";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/sales", label: "Sales", icon: ShoppingBag },
  { href: "/payments", label: "Payments", icon: WalletCards },
  { href: "/receipts", label: "Receipts", icon: ReceiptText },
  { href: "/expenses", label: "Expenses", icon: CircleDollarSign },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/business/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as unknown as { id: string }).id;
  const member = userId
    ? await prisma.businessMember.findFirst({ where: { userId }, include: { business: true } })
    : null;
  if (!member) redirect("/create-business");

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-plum">
      <div className="flex min-h-screen">
        <aside className="hidden w-[248px] shrink-0 flex-col border-r border-plum/10 bg-plum text-white lg:flex print:hidden">
          <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-5">
            <OpenBooksBrandMark size={36} light />
            <div className="min-w-0">
              <p className="font-heading text-[15px] font-extrabold tracking-tight">OpenBooks</p>
              <p className="truncate text-[10px] font-medium uppercase tracking-[0.14em] text-white/50">Business workspace</p>
            </div>
          </div>

          <div className="px-4 pb-3 pt-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pale-sage text-sm font-extrabold text-plum">
                  {(member.business.name?.[0] ?? "O").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{member.business.name}</p>
                  <p className="truncate text-xs text-white/50">NGN · {firstName}</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 pb-5">
            <p className="px-3 pb-2 pt-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/35">Workspace</p>
            {navigation.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/65 transition-colors hover:bg-white/6 hover:text-white ${href === "/dashboard" ? "bg-white/10 text-white" : ""}`}
              >
                <Icon size={17} strokeWidth={1.9} />
                <span>{label}</span>
                {href === "/dashboard" && <ChevronRight className="ml-auto text-pale-sage" size={15} />}
              </Link>
            ))}
          </nav>

          <div className="border-t border-white/10 p-4">
            <Link href="/guide" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/65 transition-colors hover:bg-white/6 hover:text-white">
              <BookOpen size={17} strokeWidth={1.9} />
              <span>OpenBooks guide</span>
            </Link>
            <p className="px-3 pt-2 text-[10px] leading-4 text-white/35">Simple records. Clear payments. Less guessing.</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex min-h-[72px] items-center justify-between border-b border-plum/10 bg-[#F8F8F6]/95 px-4 backdrop-blur-xl lg:px-8 print:hidden">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-plum lg:hidden">
                <span className="text-xs font-extrabold text-white">OB</span>
              </div>
              <div className="min-w-0">
                <p className="truncate font-heading text-sm font-extrabold text-plum">{member.business.name}</p>
                <p className="text-[11px] font-medium text-plum/45">Business workspace · NGN</p>
              </div>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <Link href="/business/settings" className="rounded-xl p-2.5 text-plum/50 transition-colors hover:bg-white hover:text-plum" aria-label="Open settings">
                <Settings size={18} />
              </Link>
              <div className="h-8 w-px bg-plum/10" />
              <div className="flex items-center gap-2 rounded-xl border border-plum/10 bg-white px-2.5 py-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pale-sage text-[10px] font-extrabold text-plum">
                  {(firstName[0] ?? "U").toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate text-xs font-bold text-plum">{firstName}</span>
              </div>
            </div>
          </header>

          <nav className="flex gap-2 overflow-x-auto border-b border-plum/10 bg-white px-4 py-3 lg:hidden print:hidden">
            {navigation.slice(0, 6).map(({ href, label }) => (
              <Link key={href} href={href} className="whitespace-nowrap rounded-full border border-plum/10 bg-[#F8F8F6] px-4 py-2 text-xs font-bold text-plum/65 transition-colors hover:border-plum/20 hover:text-plum">
                {label}
              </Link>
            ))}
          </nav>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
