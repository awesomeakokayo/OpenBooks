import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createPageMetadata } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/seo/site";

export const metadata: Metadata = createPageMetadata({
  title: "Small Business Bookkeeping in Nigeria: A Simple Guide",
  description: "Learn a simple bookkeeping system for a Nigerian small business: record sales, expenses, customer balances and payments without complicated accounting software.",
  path: "/guides/small-business-bookkeeping-nigeria",
});

export default function Page() {
  return (
    <main className="min-h-screen bg-[#F8F8F6] text-plum">
      <header className="border-b border-plum/10 bg-plum text-white">
        <div className="mx-auto flex max-w-[900px] items-center justify-between px-5 py-5 lg:px-8">
          <Link href="/" className="font-heading text-xl font-bold text-white">{SITE_NAME}</Link>
          <Link href="/guides" className="text-sm font-semibold text-white/70 hover:text-white">All guides</Link>
        </div>
      </header>
      <article className="mx-auto max-w-[900px] px-5 pb-20 pt-14 lg:px-8 lg:pb-28 lg:pt-20">
        <p className="openbooks-eyebrow text-terracotta">Bookkeeping</p>
        <h1 className="mt-4 font-heading text-[clamp(2.7rem,6vw,5.3rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">Small business bookkeeping in Nigeria: a simple guide.</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-plum/65">Good bookkeeping does not have to mean complicated accounting. A small business needs a reliable record of what it sold, what it spent, what customers paid and what customers still owe.</p>
        <div className="mt-12 space-y-10 text-base leading-8 text-plum/70">
          <section><h2 className="font-heading text-2xl font-extrabold sm:text-3xl">1. Record every sale</h2><p className="mt-4">Capture the date, customer when known, item or service, amount and whether the transaction was paid immediately or on credit. Consistency matters more than fancy spreadsheets.</p></section>
          <section><h2 className="font-heading text-2xl font-extrabold sm:text-3xl">2. Record every business expense</h2><p className="mt-4">Track supplier purchases, transport, subscriptions, utilities and other business costs. Keep a receipt, transfer reference or other proof where available, and separate business spending from personal spending.</p></section>
          <section><h2 className="font-heading text-2xl font-extrabold sm:text-3xl">3. Track who owes you</h2><p className="mt-4">Credit sales should not disappear into notebooks or chat messages. Keep the original transaction, due amount, payment history and current balance connected to the customer.</p></section>
          <section><h2 className="font-heading text-2xl font-extrabold sm:text-3xl">4. Review the numbers regularly</h2><p className="mt-4">A weekly review can answer four useful questions: How much did we sell? How much did we collect? How much did we spend? How much is still outstanding? Those answers create a much clearer picture of the business.</p></section>
        </div>
        <div className="mt-14 rounded-3xl bg-plum p-7 text-white sm:p-9"><p className="text-xs font-bold uppercase tracking-[0.16em] text-pale-sage">Put it into practice</p><h2 className="mt-2 font-heading text-2xl font-extrabold">Keep the records in one place with OpenBooks.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Record sales, expenses, customers, invoices and payments without building your own bookkeeping system.</p><Link href="/register" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-terracotta px-5 py-3 text-sm font-bold text-white">Start for free <ArrowRight size={16} /></Link></div>
      </article>
    </main>
  );
}
