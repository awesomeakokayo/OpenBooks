import type { Metadata } from "next";
import { ArrowRight, Check } from "lucide-react";
import { OpenBooksBrandMark } from "@/components/openbooks-brand-mark";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Bookkeeping and Invoicing for Nigerian Small Businesses",
  description:
    "Record sales, create invoices, track expenses, see who owes you and keep simple business records with OpenBooks, built for Nigerian small businesses.",
  path: "/for-businesses",
});

const benefits = ["Record sales in seconds", "Create and share invoices", "Choose your own payment methods", "Track who owes you", "Issue receipts", "See simple business reports"];

export default function ForBusinessesPage() {
  return <main className="min-h-screen bg-[#F8F8F6] text-[#503047]"><header className="bg-[#503047] text-white"><div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-5"><Link href="/" className="flex items-center gap-2.5 font-heading text-xl font-bold"><OpenBooksBrandMark size={32} /><span>Open<span className="text-[#C05746]">Books</span></span></Link><Link href="/" className="text-sm font-semibold text-white/75 hover:text-white">Back home</Link></div></header><section className="mx-auto max-w-[1100px] px-5 py-24 lg:py-32"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C05746]">For business owners</p><h1 className="mt-5 max-w-4xl font-heading text-[clamp(3rem,6vw,5.8rem)] font-extrabold leading-[0.94] tracking-[-0.05em]">Run the business. Let OpenBooks handle the paper trail.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#6F6670]">Built for the barber, tailor, phone repairer, caterer, photographer, mechanic and small shop owner who just wants to know what came in, what went out and who still owes.</p><div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{benefits.map((item) => <div key={item} className="flex gap-3 rounded-3xl border border-[#E5E3DF] bg-white p-6"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D0E3C4]"><Check size={16}/></span><p className="text-sm font-semibold leading-6">{item}</p></div>)}</div><div className="mt-12 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#C05746] px-6 py-3.5 text-sm font-semibold text-white">Start for free <ArrowRight size={16}/></Link><Link href="/guide" className="inline-flex items-center justify-center rounded-2xl border border-[#503047]/15 px-6 py-3.5 text-sm font-semibold">See the guide</Link></div></section></main>;
}
