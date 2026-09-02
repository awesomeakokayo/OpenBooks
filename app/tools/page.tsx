import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, FileText, ReceiptText } from "lucide-react";
import { OpenBooksBrandMark } from "@/components/openbooks-brand-mark";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Free Business Tools for Invoicing, Receipts and Profit | OpenBooks",
  description: "Use free OpenBooks business tools to create invoices and receipts or calculate profit in Nigerian naira. No account required to start.",
  path: "/tools",
});

const tools = [
  { href: "/tools/invoice-generator", title: "Free Invoice Generator", text: "Create a clean invoice in NGN, preview it instantly and print or save it as a PDF.", icon: FileText },
  { href: "/tools/receipt-generator", title: "Free Receipt Generator", text: "Create a simple payment receipt for cash, transfer, POS or Paystack payments.", icon: ReceiptText },
  { href: "/tools/profit-calculator", title: "Small Business Profit Calculator", text: "Calculate gross profit, net profit and profit margin from your business numbers.", icon: Calculator },
];

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-[#F8F8F6] text-plum">
      <header className="bg-plum text-white"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-5 lg:px-8"><Link href="/" className="flex items-center gap-2.5 font-heading text-xl font-bold"><OpenBooksBrandMark size={32} light />OpenBooks</Link><Link href="/" className="text-sm font-semibold text-white/70 hover:text-white">Back home</Link></div></header>
      <section className="mx-auto max-w-[1180px] px-5 py-16 lg:px-8 lg:py-24">
        <p className="openbooks-eyebrow text-terracotta">Free business tools</p>
        <h1 className="mt-4 max-w-4xl font-heading text-[clamp(2.8rem,6vw,5.6rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">Useful tools for the numbers behind your business.</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-plum/60">Create an invoice, issue a receipt or understand your profit before you decide what to do next. These tools are free to use without an OpenBooks account.</p>
        <div className="mt-12 grid gap-5 md:grid-cols-3">{tools.map(({ href, title, text, icon: Icon }) => <Link key={href} href={href} className="group rounded-3xl border border-plum/10 bg-white p-6 shadow-[0_14px_40px_rgba(80,48,71,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(80,48,71,0.09)]"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pale-sage text-plum"><Icon size={22} /></span><h2 className="mt-6 font-heading text-xl font-extrabold">{title}</h2><p className="mt-2 text-sm leading-6 text-plum/50">{text}</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-terracotta">Use tool <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" /></span></Link>)}</div>
        <section className="mt-16 rounded-3xl bg-plum p-7 text-white sm:p-9"><p className="text-xs font-bold uppercase tracking-[0.16em] text-pale-sage">More than a generator</p><h2 className="mt-2 max-w-3xl font-heading text-2xl font-extrabold sm:text-3xl">Keep the customer, sale, invoice, payment and receipt connected.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">OpenBooks is built for Nigerian small businesses and freelancers who want simple records without turning everyday business into an accounting class.</p><Link href="/register" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-terracotta px-5 text-sm font-bold text-white hover:bg-terracotta-dark">Start for free <ArrowRight size={16} /></Link></section>
      </section>
    </main>
  );
}
