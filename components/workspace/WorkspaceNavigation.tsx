"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  CircleDollarSign,
  FileText,
  LayoutDashboard,
  Menu,
  ReceiptText,
  Settings,
  ShoppingBag,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";
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
] as const;

function isActivePath(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function WorkspaceNavigation({
  businessName,
  firstName,
}: {
  businessName: string;
  firstName: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = (firstName[0] ?? "U").toUpperCase();
  const businessInitial = (businessName[0] ?? "O").toUpperCase();

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-plum/10 bg-plum text-white lg:flex print:hidden">
        <div className="flex h-[84px] shrink-0 items-center gap-3 border-b border-white/10 px-5">
          <OpenBooksBrandMark size={36} light />
          <div className="min-w-0">
            <p className="font-heading text-[15px] font-extrabold tracking-tight">OpenBooks</p>
            <p className="truncate text-[10px] font-medium uppercase tracking-[0.14em] text-white/50">Business workspace</p>
          </div>
        </div>

        <div className="px-4 pb-4 pt-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pale-sage text-sm font-extrabold text-plum">
                {businessInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{businessName}</p>
                <p className="truncate text-xs text-white/50">NGN · {firstName}</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-5">
          <p className="px-3 pb-3 pt-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/35">Workspace</p>
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                  active ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/6 hover:text-white"
                }`}
              >
                <Icon size={17} strokeWidth={1.9} />
                <span>{label}</span>
                {active && <ChevronRight className="ml-auto text-pale-sage" size={15} />}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-4">
          <Link href="/guide" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/65 transition-colors hover:bg-white/6 hover:text-white">
            <BookOpen size={17} strokeWidth={1.9} />
            <span>OpenBooks guide</span>
          </Link>
          <p className="px-3 pt-2 text-[10px] leading-4 text-white/35">Simple records. Clear payments. Less guessing.</p>
        </div>
      </aside>

      <header className="sticky top-0 z-50 flex min-h-[84px] items-center justify-between border-b border-plum/10 bg-[#F8F8F6]/95 px-4 backdrop-blur-xl lg:px-8 print:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-plum text-white lg:hidden"
            aria-label="Open workspace navigation"
          >
            <Menu size={19} />
          </button>
          <div className="min-w-0">
            <p className="truncate font-heading text-sm font-extrabold text-plum">{businessName}</p>
            <p className="text-[11px] font-medium text-plum/45">Business workspace · NGN</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/business/settings" className="rounded-xl p-2.5 text-plum/50 transition-colors hover:bg-white hover:text-plum" aria-label="Open settings">
            <Settings size={18} />
          </Link>
          <div className="hidden h-8 w-px bg-plum/10 sm:block" />
          <div className="flex items-center gap-2 rounded-xl border border-plum/10 bg-white px-2.5 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pale-sage text-[10px] font-extrabold text-plum">{initials}</div>
            <span className="hidden max-w-[120px] truncate text-xs font-bold text-plum sm:block">{firstName}</span>
          </div>
        </div>
      </header>

      <div className="fixed inset-0 z-[60] lg:hidden" data-open={mobileOpen} hidden={!mobileOpen}>
        <button type="button" className="absolute inset-0 bg-plum/40 backdrop-blur-sm" aria-label="Close workspace navigation" onClick={() => setMobileOpen(false)} />
        <div className="absolute inset-y-0 left-0 flex w-[min(88vw,320px)] flex-col bg-plum text-white shadow-2xl">
          <div className="flex h-[84px] shrink-0 items-center justify-between border-b border-white/10 px-5">
            <div className="flex items-center gap-3">
              <OpenBooksBrandMark size={34} light />
              <div>
                <p className="font-heading text-[15px] font-extrabold">OpenBooks</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">Workspace</p>
              </div>
            </div>
            <button type="button" onClick={() => setMobileOpen(false)} className="rounded-xl p-2 text-white/65 hover:bg-white/10 hover:text-white" aria-label="Close workspace navigation">
              <X size={19} />
            </button>
          </div>
          <div className="px-4 py-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="truncate text-sm font-bold">{businessName}</p>
              <p className="mt-1 text-xs text-white/50">NGN · {firstName}</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-5">
            {navigation.map(({ href, label, icon: Icon }) => {
              const active = isActivePath(pathname, href);
              return (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${active ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/6 hover:text-white"}`}>
                  <Icon size={17} strokeWidth={1.9} />
                  <span>{label}</span>
                  {active && <ChevronRight className="ml-auto text-pale-sage" size={15} />}
                </Link>
              );
            })}
            <Link href="/guide" onClick={() => setMobileOpen(false)} className="mt-4 flex items-center gap-3 rounded-xl border-t border-white/10 px-3 py-4 text-sm font-semibold text-white/65 hover:text-white">
              <BookOpen size={17} strokeWidth={1.9} />
              <span>OpenBooks guide</span>
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
