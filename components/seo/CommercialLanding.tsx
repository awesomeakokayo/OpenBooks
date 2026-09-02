import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SITE_NAME, SITE_URL } from "@/lib/seo/site";

type Feature = { title: string; copy: string };

type CommercialLandingProps = {
  eyebrow: string;
  title: string;
  description: string;
  answer: string;
  features: Feature[];
  workflow: string[];
  audience: string;
  related: Array<{ href: string; label: string }>;
};

export function CommercialLanding({
  eyebrow,
  title,
  description,
  answer,
  features,
  workflow,
  audience,
  related,
}: CommercialLandingProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description,
    isAccessibleForFree: true,
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <main className="min-h-screen bg-[#F8F8F6] text-plum">
      <header className="border-b border-white/10 bg-plum text-white">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-5 lg:px-8">
          <Link href="/" className="font-heading text-xl font-bold text-white">{SITE_NAME}</Link>
          <Link href="/register" className="rounded-xl bg-terracotta px-4 py-2.5 text-sm font-bold text-white">Start free</Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1180px] px-5 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
        <p className="openbooks-eyebrow text-terracotta">{eyebrow}</p>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <h1 className="mt-4 font-heading text-[clamp(2.9rem,6vw,6rem)] font-extrabold leading-[0.94] tracking-[-0.05em]">{title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-plum/65">{description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-terracotta px-7 text-sm font-bold text-white">Start for free <ArrowRight size={17} /></Link>
              <Link href="/tools" className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-plum/10 bg-white px-7 text-sm font-bold text-plum">Try a free tool</Link>
            </div>
          </div>
          <div className="rounded-3xl bg-plum p-7 text-white shadow-[0_24px_70px_rgba(80,48,71,0.14)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-pale-sage">The answer</p>
            <p className="mt-4 text-base leading-7 text-white/80">{answer}</p>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-white/45">Built for</p>
            <p className="mt-2 text-sm font-semibold text-white">{audience}</p>
          </div>
        </div>

        <section className="mt-16">
          <p className="openbooks-eyebrow text-terracotta">What OpenBooks handles</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-3xl border border-[#E3E1DE] bg-white p-7">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pale-sage text-plum"><Check size={16} /></div>
                <h2 className="mt-5 font-heading text-xl font-extrabold">{feature.title}</h2>
                <p className="mt-3 text-sm leading-6 text-plum/60">{feature.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="openbooks-eyebrow text-terracotta">Simple workflow</p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold tracking-[-0.03em]">From transaction to clear records.</h2>
            <p className="mt-4 text-base leading-7 text-plum/60">The software should reduce the work around the transaction, not create a new admin job.</p>
          </div>
          <div className="rounded-3xl bg-white p-6 sm:p-8">
            <div className="space-y-5">
              {workflow.map((step, index) => (
                <div key={step} className="flex gap-4 border-b border-[#E8E5E2] pb-5 last:border-b-0 last:pb-0">
                  <span className="font-mono text-xs font-bold text-terracotta">0{index + 1}</span>
                  <p className="text-sm leading-6 text-plum/70">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-16 rounded-3xl bg-pale-sage p-7 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-terracotta">One place</p>
          <h2 className="mt-2 max-w-3xl font-heading text-3xl font-extrabold tracking-[-0.03em]">Stop rebuilding your business picture from notebooks, chats and payment screenshots.</h2>
          <Link href="/register" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-plum px-5 py-3 text-sm font-bold text-white">Create your free account <ArrowRight size={16} /></Link>
        </div>

        <nav aria-label="Related OpenBooks resources" className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm">
          {related.map((item) => <Link key={item.href} href={item.href} className="font-semibold text-plum/60 underline decoration-plum/10 underline-offset-4 hover:text-terracotta">{item.label}</Link>)}
        </nav>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </main>
  );
}
