import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OpenBooksBrandMark } from "@/components/openbooks-brand-mark";

export function ToolShell({
  eyebrow,
  title,
  description,
  children,
  related = [],
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  related?: ReadonlyArray<{ href: string; label: string }>;
}) {
  return (
    <main className="min-h-screen bg-[#F8F8F6] text-plum">
      <header className="border-b border-white/10 bg-plum text-white">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 font-heading text-xl font-bold text-white">
            <OpenBooksBrandMark size={32} light />
            <span>OpenBooks</span>
          </Link>
          <Link href="/tools" className="text-sm font-semibold text-white/70 hover:text-white">All tools</Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1180px] px-5 pb-16 pt-14 lg:px-8 lg:pb-24 lg:pt-20">
        <p className="openbooks-eyebrow text-terracotta">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-heading text-[clamp(2.7rem,6vw,5.5rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">{title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-plum/60 sm:text-lg sm:leading-8">{description}</p>

        <div className="mt-10">{children}</div>

        <div className="mt-14 grid gap-4 rounded-3xl bg-plum p-6 text-white sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-pale-sage">Keep your records together</p>
            <h2 className="mt-2 font-heading text-2xl font-extrabold">Use OpenBooks for the work after the tool.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">Record sales, manage customers, send invoices, track payments and see what your business is owed.</p>
          </div>
          <Link href="/register" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-terracotta px-5 text-sm font-bold text-white hover:bg-terracotta-dark">Start for free <ArrowRight size={16} /></Link>
        </div>

        {related.length ? (
          <nav aria-label="Related OpenBooks resources" className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm">
            {related.map((item) => <Link key={item.href} href={item.href} className="font-semibold text-plum/60 underline decoration-plum/10 underline-offset-4 hover:text-terracotta">{item.label}</Link>)}
          </nav>
        ) : null}
      </section>
    </main>
  );
}
