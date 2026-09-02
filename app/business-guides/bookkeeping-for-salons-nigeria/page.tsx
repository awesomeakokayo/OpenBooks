import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createPageMetadata } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/seo/site";

export const metadata: Metadata = createPageMetadata({
  title: "Bookkeeping for Hair Salons in Nigeria: Simple Guide",
  description: "Learn a simple record-keeping workflow for Nigerian salons covering daily service sales, customer payments, expenses and profit.",
  path: "/business-guides/bookkeeping-for-salons-nigeria",
});

export default function Page() {
  return <main className="min-h-screen bg-[#F8F8F6] text-plum"><header className="border-b border-plum/10 bg-plum text-white"><div className="mx-auto flex max-w-[900px] items-center justify-between px-5 py-5 lg:px-8"><Link href="/" className="font-heading text-xl font-bold text-white">{SITE_NAME}</Link><Link href="/business-guides" className="text-sm font-semibold text-white/70 hover:text-white">Business guides</Link></div></header><article className="mx-auto max-w-[900px] px-5 pb-20 pt-14 lg:px-8 lg:pb-28 lg:pt-20"><p className="openbooks-eyebrow text-terracotta">Hair salons</p><h1 className="mt-4 font-heading text-[clamp(2.7rem,6vw,5.3rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">Bookkeeping for hair salons in Nigeria.</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-plum/65">A salon can have dozens of small transactions in a day. The useful system is the one that makes service sales, payments and operating costs easy to total.</p><div className="mt-12 space-y-10 text-base leading-8 text-plum/70"><section><h2 className="font-heading text-2xl font-extrabold sm:text-3xl">Record each service sale</h2><p className="mt-4">Capture the date, service, amount and payment method. Where a customer has an account or books repeat services, keep their customer history connected to the transactions.</p></section><section><h2 className="font-heading text-2xl font-extrabold sm:text-3xl">Track expenses that affect margins</h2><p className="mt-4">Record products and supplies, electricity, staff-related costs, rent and other business expenses. Reviewing them alongside service sales shows where costs are growing.</p></section><section><h2 className="font-heading text-2xl font-extrabold sm:text-3xl">Review the day before closing</h2><p className="mt-4">Compare recorded sales with cash, transfers, POS and other payment methods. A quick daily review catches missing transactions while the details are still fresh.</p></section></div><div className="mt-14 rounded-3xl bg-plum p-7 text-white sm:p-9"><h2 className="font-heading text-2xl font-extrabold">Keep salon sales and expenses in one place.</h2><Link href="/register" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-terracotta px-5 py-3 text-sm font-bold text-white">Start for free <ArrowRight size={16} /></Link></div></article></main>;
}
