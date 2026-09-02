import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { createPageMetadata } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/seo/site";

export const metadata: Metadata = createPageMetadata({
  title: "Small Business Bookkeeping Alternatives and Better Workflows | OpenBooks",
  description: "Compare common ways small businesses manage sales, invoices, payments and expenses, and see when a simple bookkeeping system makes sense.",
  path: "/alternatives",
});

const rows = [
  ["Notebook only", "Fast to start", "Hard to search and balance", "Good for notes; weak for connected records"],
  ["Spreadsheet", "Flexible", "Needs manual structure and upkeep", "Useful for analysis; easy to outgrow"],
  ["Chat + screenshots", "Convenient", "Records become fragmented", "Useful for communication; poor as a source of truth"],
  ["OpenBooks", "Simple workspace", "Built around sales, customers and payments", "Connect transactions into a usable record"],
];

export default function Page() {
  return (
    <main className="min-h-screen bg-[#F8F8F6] text-plum">
      <header className="border-b border-white/10 bg-plum text-white">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-5 lg:px-8">
          <Link href="/" className="font-heading text-xl font-bold text-white">{SITE_NAME}</Link>
          <Link href="/register" className="rounded-xl bg-terracotta px-4 py-2.5 text-sm font-bold text-white">Start free</Link>
        </div>
      </header>
      <section className="mx-auto max-w-[1180px] px-5 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
        <p className="openbooks-eyebrow text-terracotta">Choosing a bookkeeping workflow</p>
        <h1 className="mt-4 max-w-5xl font-heading text-[clamp(2.9rem,6vw,5.8rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">The best system is the one that keeps the whole transaction clear.</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-plum/65">Different businesses start with notebooks, spreadsheets or messaging apps. The problem appears when the sale, customer, invoice and payment stop living together.</p>

        <div className="mt-12 overflow-x-auto rounded-3xl border border-[#E3E1DE] bg-white">
          <table className="min-w-[760px] w-full border-collapse text-left text-sm">
            <thead><tr className="border-b border-[#E8E5E2]"><th className="p-5 font-bold">Workflow</th><th className="p-5 font-bold">Strength</th><th className="p-5 font-bold">Trade-off</th><th className="p-5 font-bold">Best use</th></tr></thead>
            <tbody>{rows.map(([name, strength, tradeoff, use]) => <tr key={name} className="border-b border-[#E8E5E2] last:border-0"><td className="p-5 font-semibold">{name}</td><td className="p-5 text-plum/65">{strength}</td><td className="p-5 text-plum/65">{tradeoff}</td><td className="p-5 text-plum/65">{use}</td></tr>)}</tbody>
          </table>
        </div>

        <section className="mt-14 grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-[#E3E1DE] bg-white p-7"><div className="flex gap-2 items-center"><X size={17} className="text-terracotta" /><span className="font-bold">A scattered workflow</span></div><p className="mt-4 text-sm leading-6 text-plum/60">The sale sits in a notebook, customer details in WhatsApp, invoice in a PDF folder and payment somewhere else. Reporting then becomes a reconstruction exercise.</p></article>
          <article className="rounded-3xl bg-plum p-7 text-white"><div className="flex gap-2 items-center"><Check size={17} className="text-pale-sage" /><span className="font-bold">A connected workflow</span></div><p className="mt-4 text-sm leading-6 text-white/65">OpenBooks keeps the customer, transaction, invoice, payment and outstanding balance connected so the record remains useful after the sale.</p></article>
        </section>

        <div className="mt-14 flex flex-wrap gap-x-5 gap-y-3 text-sm">
          <Link href="/bookkeeping-software-nigeria" className="font-semibold text-plum/60 underline underline-offset-4 hover:text-terracotta">Bookkeeping software for Nigeria</Link>
          <Link href="/invoice-software-nigeria" className="font-semibold text-plum/60 underline underline-offset-4 hover:text-terracotta">Invoice software for Nigeria</Link>
          <Link href="/tools" className="font-semibold text-plum/60 underline underline-offset-4 hover:text-terracotta">Free business tools</Link>
          <Link href="/register" className="inline-flex items-center gap-2 font-bold text-terracotta">Start with OpenBooks <ArrowRight size={16} /></Link>
        </div>
      </section>
    </main>
  );
}
