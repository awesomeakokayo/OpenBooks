import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createPageMetadata } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/seo/site";

export const metadata: Metadata = createPageMetadata({
  title: "Bookkeeping Guides by Business Type | OpenBooks",
  description: "Practical record-keeping and bookkeeping workflows for Nigerian tailors, salons, retail shops and consultants.",
  path: "/business-guides",
});

const guides = [
  ["Tailors", "bookkeeping-for-tailors-nigeria", "Track fabric purchases, customer deposits, balances and completed orders without losing the transaction history."],
  ["Hair Salons", "bookkeeping-for-salons-nigeria", "Keep daily service sales, customer records, expenses and payment history organized."],
  ["Retail Shops", "bookkeeping-for-retail-shops-nigeria", "Record product sales, cash and credit transactions, expenses and customer balances."],
  ["Consultants", "bookkeeping-for-consultants-nigeria", "Manage client invoices, project payments, expenses and outstanding balances with a simple workflow."],
] as const;

export default function BusinessGuidesPage() {
  return <main className="min-h-screen bg-[#F8F8F6] text-plum"><header className="border-b border-plum/10 bg-plum text-white"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-5 lg:px-8"><Link href="/" className="font-heading text-xl font-bold text-white">{SITE_NAME}</Link><Link href="/for-businesses" className="text-sm font-semibold text-white/70 hover:text-white">For businesses</Link></div></header><section className="mx-auto max-w-[1180px] px-5 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24"><p className="openbooks-eyebrow text-terracotta">Business workflows</p><h1 className="mt-4 max-w-5xl font-heading text-[clamp(2.9rem,6vw,5.8rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">Bookkeeping advice for the way different businesses actually work.</h1><p className="mt-6 max-w-3xl text-base leading-7 text-plum/60 sm:text-lg sm:leading-8">The records a tailor needs are not exactly the same as a salon or consultant. These guides connect common workflows to simple bookkeeping habits.</p><div className="mt-12 grid gap-4 md:grid-cols-2">{guides.map(([title, slug, description]) => <article key={slug} className="rounded-3xl border border-[#E3E1DE] bg-white p-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-terracotta">Nigeria</p><h2 className="mt-4 font-heading text-2xl font-extrabold">{title}</h2><p className="mt-3 text-sm leading-6 text-plum/60">{description}</p><Link href={`/business-guides/${slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-plum hover:text-terracotta">Read guide <ArrowRight size={16} /></Link></article>)}</div></section></main>;
}
