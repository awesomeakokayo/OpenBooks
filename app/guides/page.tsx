import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createPageMetadata } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/seo/site";

export const metadata: Metadata = createPageMetadata({
  title: "Small Business Bookkeeping Guides for Nigeria",
  description:
    "Practical guides for Nigerian small businesses and freelancers on invoices, receipts, sales tracking, expenses, profit and customer balances.",
  path: "/guides",
});

const guides = [
  {
    slug: "how-to-create-an-invoice-in-nigeria",
    title: "How to Create an Invoice in Nigeria",
    description: "A practical step-by-step guide to making a clear invoice, what to include, and how to keep the payment record afterward.",
    category: "Invoicing",
  },
  {
    slug: "invoice-vs-receipt",
    title: "Invoice vs Receipt: What Is the Difference?",
    description: "Understand when to send an invoice, when to issue a receipt, and how both fit into a simple sales record.",
    category: "Invoicing",
  },
  {
    slug: "how-to-track-daily-sales",
    title: "How to Track Daily Sales for a Small Business",
    description: "A simple daily sales workflow for shops, service businesses, freelancers and other small businesses.",
    category: "Sales",
  },
  {
    slug: "how-to-track-business-expenses",
    title: "How to Track Business Expenses",
    description: "Learn a practical way to record business spending, separate business costs from personal spending, and review where money goes.",
    category: "Expenses",
  },
  {
    slug: "how-to-calculate-small-business-profit",
    title: "How to Calculate Small Business Profit",
    description: "See how to calculate gross profit, net profit and profit margin using numbers you can actually collect from your business.",
    category: "Profit",
  },
  {
    slug: "how-to-track-customers-who-owe-you",
    title: "How to Track Customers Who Owe You Money",
    description: "Build a simple customer-balance workflow so credit sales, due amounts and payments do not disappear in chat messages or notebooks.",
    category: "Customers",
  },
];

export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-[#F8F8F6] text-plum">
      <header className="border-b border-plum/10 bg-plum text-white">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-5 lg:px-8">
          <Link href="/" className="font-heading text-xl font-bold text-white">{SITE_NAME}</Link>
          <Link href="/tools" className="text-sm font-semibold text-white/70 hover:text-white">Free tools</Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1180px] px-5 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
        <p className="openbooks-eyebrow text-terracotta">OpenBooks guides</p>
        <h1 className="mt-4 max-w-5xl font-heading text-[clamp(2.9rem,6vw,5.8rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">
          Practical answers for running a small business.
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-7 text-plum/60 sm:text-lg sm:leading-8">
          Straightforward answers to the bookkeeping questions that come up when you sell, invoice customers, pay expenses and try to understand whether the business is actually making money.
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <article key={guide.slug} className="flex h-full flex-col rounded-3xl border border-[#E3E1DE] bg-white p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-terracotta">{guide.category}</p>
              <h2 className="mt-4 font-heading text-2xl font-extrabold leading-tight">{guide.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-plum/60">{guide.description}</p>
              <Link href={`/guides/${guide.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-plum hover:text-terracotta">
                Read guide <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-plum p-7 text-white sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-pale-sage">Do the work, not just the reading</p>
          <h2 className="mt-2 max-w-2xl font-heading text-2xl font-extrabold sm:text-3xl">Use a free OpenBooks tool alongside each guide.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Create an invoice, make a receipt or calculate profit without creating an account.</p>
          <Link href="/tools" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-terracotta px-5 py-3 text-sm font-bold text-white">Explore free tools <ArrowRight size={16} /></Link>
        </div>
      </section>
    </main>
  );
}
