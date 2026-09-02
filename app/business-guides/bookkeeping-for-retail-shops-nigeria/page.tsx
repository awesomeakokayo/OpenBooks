import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createPageMetadata } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/seo/site";

export const metadata: Metadata = createPageMetadata({
  title: "Bookkeeping for Retail Shops in Nigeria: Simple Guide",
  description: "A practical bookkeeping workflow for Nigerian retail shops to record daily sales, credit sales, expenses, customer balances and payments.",
  path: "/business-guides/bookkeeping-for-retail-shops-nigeria",
});

export default function Page() {
  return <main className="min-h-screen bg-[#F8F8F6] text-plum"><header className="border-b border-plum/10 bg-plum text-white"><div className="mx-auto flex max-w-[900px] items-center justify-between px-5 py-5 lg:px-8"><Link href="/" className="font-heading text-xl font-bold text-white">{SITE_NAME}</Link><Link href="/business-guides" className="text-sm font-semibold text-white/70 hover:text-white">Business guides</Link></div></header><article className="mx-auto max-w-[900px] px-5 pb-20 pt-14 lg:px-8 lg:pb-28 lg:pt-20"><p className="openbooks-eyebrow text-terracotta">Retail shops</p><h1 className="mt-4 font-heading text-[clamp(2.7rem,6vw,5.3rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">Bookkeeping for retail shops in Nigeria.</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-plum/65">Retail shops need a record that handles fast daily sales, stock-related spending, different payment methods and customers who buy on credit.</p><div className="mt-12 space-y-10 text-base leading-8 text-plum/70"><section><h2 className="font-heading text-2xl font-extrabold sm:text-3xl">Record daily sales consistently</h2><p className="mt-4">Capture what was sold, the amount, date and payment method. For repeat customers, keep the customer attached to the transaction so you can review their history later.</p></section><section><h2 className="font-heading text-2xl font-extrabold sm:text-3xl">Keep credit sales separate from later payments</h2><p className="mt-4">Record the full sale when the goods leave the shop, then add later payments separately. This keeps customer balances accurate and prevents payments from being counted as extra sales.</p></section><section><h2 className="font-heading text-2xl font-extrabold sm:text-3xl">Track the costs behind the sales</h2><p className="mt-4">Record stock purchases, transport, rent, utilities and other business expenses. Comparing those costs with sales gives you a better view of the shop's actual performance.</p></section></div><div className="mt-14 rounded-3xl bg-plum p-7 text-white sm:p-9"><h2 className="font-heading text-2xl font-extrabold">Build a clearer retail record with OpenBooks.</h2><Link href="/register" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-terracotta px-5 py-3 text-sm font-bold text-white">Start for free <ArrowRight size={16} /></Link></div></article></main>;
}
