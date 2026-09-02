import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { OpenBooksBrandMark } from "@/components/openbooks-brand-mark";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "How to Use OpenBooks for Your Small Business",
  description:
    "Learn how to set up OpenBooks, add customers, record sales, create invoices, track payments and keep simple business records in Nigeria.",
  path: "/guide",
});

const steps = [
  ["01", "Create your business", "Set up your business details and choose how customers can pay you."],
  ["02", "Add customers", "Keep a simple record of the people and businesses you sell to."],
  ["03", "Record or invoice", "Log a quick sale or create a proper invoice with a due date."],
  ["04", "Get paid and keep the proof", "Record cash, transfer or POS payments. OpenBooks keeps the payment history and receipt with the transaction."],
];

export default async function GuidePage() {
  const session = await auth();
  let hasBusiness = false;

  if (session?.user) {
    const { prisma } = await import("@/lib/db/prisma");
    const userId = (session.user as { id?: string }).id;
    if (userId) {
      hasBusiness = Boolean(await prisma.businessMember.findFirst({ where: { userId }, select: { id: true } }));
    }
  }

  const destination = hasBusiness ? "/dashboard" : "/create-business";
  const actionLabel = hasBusiness ? "Open dashboard" : session?.user ? "Set up your business" : "Start for free";

  return (
    <main className="min-h-screen bg-[#F8F8F6] text-[#503047]">
      <header className="border-b border-[#503047]/10 bg-[#503047] text-white">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-5">
          <Link href={hasBusiness ? "/dashboard" : "/"} className="flex items-center gap-2.5 font-heading text-xl font-bold">
            <OpenBooksBrandMark size={32} light />
            <span>Open<span className="text-white">Books</span></span>
          </Link>
          <Link href={hasBusiness ? "/dashboard" : "/"} className="text-sm font-semibold text-white/75 hover:text-white">
            {hasBusiness ? "Back to dashboard" : "Back home"}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1100px] px-5 py-24 lg:py-32">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C05746]">Guide</p>
        <h1 className="mt-5 max-w-4xl font-heading text-[clamp(3rem,6vw,5.8rem)] font-extrabold leading-[0.94] tracking-[-0.05em]">Learn OpenBooks by doing, not reading.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6F6670]">The product is intentionally simple. These four steps take you from your first setup to a recorded, paid transaction.</p>
        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {steps.map(([n, t, d]) => (
            <article key={n} className="rounded-3xl border border-[#E5E3DF] bg-white p-7">
              <span className="font-mono text-xs font-semibold text-[#C05746]">{n}</span>
              <h2 className="mt-5 font-heading text-2xl font-bold">{t}</h2>
              <p className="mt-3 text-sm leading-6 text-[#6F6670]">{d}</p>
            </article>
          ))}
        </div>
        <div className="mt-12">
          <Link href={destination} className="inline-flex items-center gap-2 rounded-2xl bg-[#C05746] px-6 py-3.5 text-sm font-semibold text-white">
            {actionLabel} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}