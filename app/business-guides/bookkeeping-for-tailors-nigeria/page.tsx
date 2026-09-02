import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createPageMetadata } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/seo/site";

export const metadata: Metadata = createPageMetadata({
  title: "Bookkeeping for Tailors in Nigeria: Simple Record Keeping",
  description: "A simple bookkeeping workflow for Nigerian tailors: track customer orders, deposits, fabric costs, balances, payments and profit.",
  path: "/business-guides/bookkeeping-for-tailors-nigeria",
});

export default function Page() {
  return <main className="min-h-screen bg-[#F8F8F6] text-plum"><header className="border-b border-plum/10 bg-plum text-white"><div className="mx-auto flex max-w-[900px] items-center justify-between px-5 py-5 lg:px-8"><Link href="/" className="font-heading text-xl font-bold text-white">{SITE_NAME}</Link><Link href="/business-guides" className="text-sm font-semibold text-white/70 hover:text-white">Business guides</Link></div></header><article className="mx-auto max-w-[900px] px-5 pb-20 pt-14 lg:px-8 lg:pb-28 lg:pt-20"><p className="openbooks-eyebrow text-terracotta">Tailors</p><h1 className="mt-4 font-heading text-[clamp(2.7rem,6vw,5.3rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">Bookkeeping for tailors in Nigeria.</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-plum/65">Tailoring combines customer orders, deposits, materials, alterations and final payments. A useful record keeps each job connected from the first deposit to delivery.</p><div className="mt-12 space-y-10 text-base leading-8 text-plum/70"><section><h2 className="font-heading text-2xl font-extrabold sm:text-3xl">Track each order</h2><p className="mt-4">Record the customer, order description, agreed price, measurements or reference notes, expected completion date and payment status. Give formal jobs an invoice number when useful.</p></section><section><h2 className="font-heading text-2xl font-extrabold sm:text-3xl">Separate deposits from final payment</h2><p className="mt-4">A deposit is a payment toward the agreed sale, not a second sale. Keep the original order amount and add later payments against it so the outstanding balance remains clear.</p></section><section><h2 className="font-heading text-2xl font-extrabold sm:text-3xl">Track fabric and other costs</h2><p className="mt-4">Record fabric, lining, thread, zips, transport and other job-related costs. Reviewing those costs against completed orders helps you understand which work is actually profitable.</p></section></div><div className="mt-14 rounded-3xl bg-plum p-7 text-white sm:p-9"><h2 className="font-heading text-2xl font-extrabold">Keep every customer and payment together with OpenBooks.</h2><Link href="/register" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-terracotta px-5 py-3 text-sm font-bold text-white">Start for free <ArrowRight size={16} /></Link></div></article></main>;
}
