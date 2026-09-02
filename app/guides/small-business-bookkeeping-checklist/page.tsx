import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { createPageMetadata } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/seo/site";

export const metadata: Metadata = createPageMetadata({
  title: "Small Business Bookkeeping Checklist",
  description: "Use this practical bookkeeping checklist to keep sales, expenses, invoices, payments and customer balances organized for a small business.",
  path: "/guides/small-business-bookkeeping-checklist",
});

const items = [
  "Record every sale and its payment status",
  "Record business expenses and keep supporting proof",
  "Update customer balances after every payment",
  "Number invoices consistently",
  "Mark invoices and transactions as paid when settled",
  "Review outstanding balances regularly",
  "Compare recorded payments with your actual payment channels",
  "Review sales, expenses and profit for the period",
];

export default function Page() {
  return <main className="min-h-screen bg-[#F8F8F6] text-plum"><header className="border-b border-plum/10 bg-plum text-white"><div className="mx-auto flex max-w-[900px] items-center justify-between px-5 py-5 lg:px-8"><Link href="/" className="font-heading text-xl font-bold text-white">{SITE_NAME}</Link><Link href="/guides" className="text-sm font-semibold text-white/70 hover:text-white">All guides</Link></div></header><article className="mx-auto max-w-[900px] px-5 pb-20 pt-14 lg:px-8 lg:pb-28 lg:pt-20"><p className="openbooks-eyebrow text-terracotta">Checklist</p><h1 className="mt-4 font-heading text-[clamp(2.7rem,6vw,5.3rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">Small business bookkeeping checklist.</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-plum/65">Use this checklist weekly or monthly to make sure the records behind your business decisions are complete enough to trust.</p><div className="mt-10 rounded-3xl border border-[#E3E1DE] bg-white p-6 sm:p-8"><div className="space-y-4">{items.map((item) => <div key={item} className="flex gap-3 text-base leading-7 text-plum/75"><span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-pale-sage text-plum"><Check size={13} /></span><span>{item}</span></div>)}</div></div><section className="mt-12 space-y-5 text-base leading-8 text-plum/70"><h2 className="font-heading text-2xl font-extrabold sm:text-3xl">The checklist is only useful when the records stay connected.</h2><p>Do not keep the sale in one notebook, the invoice in a chat thread and the payment in your head. The easier it is to connect a sale to its customer, invoice and payments, the easier it becomes to answer questions about what the business sold and what it is still owed.</p></section><div className="mt-14 rounded-3xl bg-plum p-7 text-white sm:p-9"><h2 className="font-heading text-2xl font-extrabold">Turn the checklist into a routine with OpenBooks.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Keep customers, sales, invoices, payments and business records together instead of rebuilding the picture every month.</p><Link href="/register" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-terracotta px-5 py-3 text-sm font-bold text-white">Start for free <ArrowRight size={16} /></Link></div></article></main>;
}
