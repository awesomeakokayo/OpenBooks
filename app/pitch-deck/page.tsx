"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileText,
  LayoutDashboard,
  Printer,
  ReceiptText,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";

const slides = [
  ["cover", "OpenBooks"],
  ["problem", "The problem"],
  ["customer", "Who it serves"],
  ["solution", "The solution"],
  ["product", "The product"],
  ["workflow", "How it works"],
  ["advantage", "Why OpenBooks"],
  ["business", "Product strategy"],
  ["roadmap", "Roadmap"],
  ["close", "The ask"],
];

const features = [
  [Users, "Customers", "Keep customer records and history together with the transactions they create."],
  [FileText, "Invoices", "Create invoices, share public invoice links and keep outstanding balances visible."],
  [WalletCards, "Payments", "Record Cash, Bank Transfer and POS payments and keep payment history attached to the right records."],
  [ReceiptText, "Receipts", "Turn recorded payments into receipts that can be kept or shared as proof."],
  [LayoutDashboard, "Reports", "See business totals and reporting periods without rebuilding the numbers manually."],
  [ShieldCheck, "Business controls", "Use authentication, tenant isolation and server-side financial rules to protect business records."],
];

const steps = [
  ["01", "Set up the business", "Add the business profile and the payment methods the business actually accepts."],
  ["02", "Record the work", "Create customers, make sales or issue an invoice for the work completed."],
  ["03", "Record the money", "When a payment arrives, record it against the right business record."],
  ["04", "Keep the proof", "OpenBooks updates payment history, balances and receipts so the trail stays together."],
];

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
      {children}
    </span>
  );
}

function SlideNumber({ value }: { value: string }) {
  return <span className="font-mono text-[10px] font-semibold tracking-[0.2em] text-[#503047]/40">{value}</span>;
}

function ProductMockup() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#503047]/10 bg-white shadow-[0_30px_90px_rgba(80,48,71,0.14)]">
      <div className="flex items-center justify-between border-b border-[#503047]/8 bg-[#F8F8F6] px-5 py-4">
        <div className="flex gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#C05746]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#D0E3C4]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#503047]/20" />
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#503047]/45">openbooks.click</span>
      </div>
      <div className="grid min-h-[330px] grid-cols-[86px_1fr]">
        <aside className="bg-[#503047] p-3">
          <div className="mx-auto mb-8 h-9 w-9 rounded-xl bg-[#D0E3C4]" />
          <div className="space-y-2">
            {["Overview", "Customers", "Invoices", "Payments", "Expenses"].map((item, index) => (
              <div
                key={item}
                className={"rounded-xl px-2 py-2 text-[8px] font-semibold " + (index === 2 ? "bg-white/12 text-white" : "text-white/55")}
              >
                {item}
              </div>
            ))}
          </div>
        </aside>
        <div className="bg-[#F8F8F6] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-[#503047]/40">Invoices</p>
              <p className="mt-1 text-xl font-extrabold tracking-tight text-[#503047]">Keep money visible.</p>
            </div>
            <div className="rounded-xl bg-[#C05746] px-3 py-2 text-[9px] font-bold text-white">+ New invoice</div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              ["Outstanding", "₦158,500"],
              ["Paid", "₦420,000"],
              ["Invoices", "18"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-[#503047]/8 bg-white p-3">
                <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#503047]/40">{label}</p>
                <p className="mt-2 text-sm font-extrabold text-[#503047]">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-[#503047]/8 bg-white">
            {[
              ["INV-001029", "John Doe", "₦150,000", "Due"],
              ["INV-001028", "Bola Design Co.", "₦42,000", "Paid"],
              ["INV-001027", "Musa Ventures", "₦65,000", "Paid"],
            ].map(([invoice, customer, amount, status]) => (
              <div key={invoice} className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-3 border-b border-[#503047]/7 px-3 py-3 text-[9px] last:border-b-0">
                <span className="font-semibold text-[#503047]">{invoice}</span>
                <span className="truncate text-[#503047]/55">{customer}</span>
                <span className="font-semibold text-[#503047]">{amount}</span>
                <span className={"rounded-full px-2 py-1 text-[8px] font-bold " + (status === "Paid" ? "bg-[#D0E3C4] text-[#36563A]" : "bg-[#F6DDD7] text-[#A94738]")}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PitchDeckPage() {
  const printDeck = () => window.print();

  return (
    <main className="min-h-screen bg-[#F3F0ED] text-[#503047]">
      <header className="print-hidden sticky top-0 z-50 border-b border-white/10 bg-[#503047]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-5 px-5 py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D0E3C4] font-heading text-sm font-extrabold text-[#503047]">OB</span>
            <span className="font-heading text-lg font-extrabold">OpenBooks</span>
          </Link>
          <div className="hidden items-center gap-2 md:flex">
            <Link href="https://www.openbooks.click" target="_blank" rel="noreferrer" className="rounded-xl px-3 py-2 text-xs font-semibold text-white/75 hover:bg-white/8 hover:text-white">Product</Link>
            <Link href="https://github.com/awesomeakokayo/OpenBooks" target="_blank" rel="noreferrer" className="rounded-xl px-3 py-2 text-xs font-semibold text-white/75 hover:bg-white/8 hover:text-white">Repository</Link>
            <button onClick={printDeck} className="inline-flex items-center gap-2 rounded-xl bg-[#C05746] px-3.5 py-2.5 text-xs font-bold text-white">
              <Printer size={14} /> Save / print deck
            </button>
          </div>
        </div>
      </header>

      <div className="print-hidden sticky top-[57px] z-40 overflow-x-auto border-b border-[#503047]/8 bg-[#F3F0ED]/92 backdrop-blur-xl">
        <nav className="mx-auto flex min-w-max max-w-[1280px] gap-1 px-5 py-2 lg:px-8">
          {slides.map(([id, label], index) => (
            <a key={id} href={"#" + id} className="rounded-lg px-2.5 py-2 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[#503047]/50 hover:bg-white hover:text-[#503047]">
              {String(index + 1).padStart(2, "0")} {label}
            </a>
          ))}
        </nav>
      </div>

      <div className="mx-auto max-w-[1280px] px-3 py-3 sm:px-5 lg:px-8 lg:py-6">
        <section id="cover" className="deck-slide relative overflow-hidden rounded-[32px] bg-[#503047] text-white">
          <div className="absolute -left-24 -top-24 h-[360px] w-[360px] rounded-full bg-[#C05746]/35 blur-3xl" />
          <div className="absolute -bottom-32 right-[-80px] h-[500px] w-[500px] rounded-full bg-[#ADC698]/18 blur-3xl" />
          <div className="relative grid min-h-[78vh] items-end gap-12 px-7 py-9 sm:px-10 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-16 lg:py-16">
            <div className="max-w-3xl self-center">
              <Tag>Startup Pitch · Financial Inclusion · 2026</Tag>
              <h1 className="mt-7 max-w-4xl font-heading text-5xl font-extrabold leading-[0.96] tracking-[-0.045em] sm:text-7xl lg:text-[6.8rem]">
                Simple books for businesses that need clarity.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
                OpenBooks is a Nigeria-first digital cashbook for small businesses and freelancers to record sales, manage customers, create invoices, track payments and keep expenses together.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="https://www.openbooks.click" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-[#C05746] px-5 py-3.5 text-sm font-bold text-white">Explore OpenBooks <ArrowRight size={17} /></Link>
                <a href="#problem" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white">View the story</a>
              </div>
            </div>
            <div className="self-end lg:pb-2">
              <div className="mx-auto max-w-[570px] lg:ml-auto">
                <ProductMockup />
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {[
                    ["Live", "public product"],
                    ["Open source", "core codebase"],
                    ["Nigeria-first", "local workflows"],
                  ].map(([value, label]) => (
                    <div key={value} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                      <p className="font-heading text-sm font-extrabold text-white">{value}</p>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-white/45">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute bottom-6 right-7"><span className="font-mono text-[10px] font-semibold tracking-[0.2em] text-white/50">01 / 10</span></div>
          </div>
        </section>

        <section id="problem" className="deck-slide mt-3 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] bg-white p-8 sm:p-10 lg:p-12">
            <SlideNumber value="02 / 10" />
            <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-[#C05746]">The problem</p>
            <h2 className="mt-4 max-w-2xl font-heading text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-6xl">
              Small business money gets scattered before it gets understood.
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[#503047]/65 sm:text-base">
              For a small business or freelancer, the financial trail can live across paper notes, spreadsheets, invoice files, bank messages and chats. The business can be working and still lack one dependable view of what was sold, what was paid and what is still outstanding.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Sales", "Recorded in one place today, reconstructed tomorrow.", "01"],
              ["Invoices", "Created, shared and then separated from the payment trail.", "02"],
              ["Payments", "Different payment methods make history harder to reconcile.", "03"],
              ["Expenses", "Small costs disappear into notes and memory.", "04"],
            ].map(([title, copy, number]) => (
              <div key={title} className="rounded-[30px] bg-[#503047] p-7 text-white">
                <span className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#ADC698]">{number}</span>
                <h3 className="mt-12 font-heading text-2xl font-extrabold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="customer" className="deck-slide mt-3 rounded-[32px] bg-[#D0E3C4]">
          <div className="grid min-h-[78vh] items-center gap-12 px-7 py-10 sm:px-10 sm:py-12 lg:grid-cols-[0.75fr_1.25fr] lg:px-16">
            <div>
              <SlideNumber value="03 / 10" />
              <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-[#C05746]">Who it serves</p>
              <h2 className="mt-4 max-w-xl font-heading text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-6xl">
                Built for people whose business is too real for guesswork.
              </h2>
              <p className="mt-6 max-w-xl text-sm leading-7 text-[#503047]/65 sm:text-base">
                OpenBooks focuses on the operational side of financial record keeping for independent workers and small teams: the daily work of selling, invoicing, collecting and recording.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Freelancers", "Professional invoices, payment records and a clear history of work."],
                ["Small businesses", "Sales, customers, invoices, expenses and reports in one workspace."],
                ["Growing operators", "A stronger financial trail before accounting complexity becomes necessary."],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-[28px] bg-white p-6">
                  <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[#503047]/40">User</p>
                  <h3 className="mt-14 font-heading text-xl font-extrabold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#503047]/60">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="solution" className="deck-slide mt-3 overflow-hidden rounded-[32px] bg-[#C05746] text-white">
          <div className="grid min-h-[78vh] items-center gap-10 px-7 py-10 sm:px-10 sm:py-12 lg:grid-cols-2 lg:px-16">
            <div>
              <SlideNumber value="04 / 10" />
              <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-[#D0E3C4]">The solution</p>
              <h2 className="mt-4 max-w-2xl font-heading text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-6xl">
                One simple workspace for the financial records behind the work.
              </h2>
              <p className="mt-6 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                OpenBooks brings the everyday trail together: customers, sales, invoices, payments, receipts, expenses and reports. The product is deliberately simpler than full accounting software while still giving business owners a reliable record.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {features.map(([Icon, title, copy]) => {
                const FeatureIcon = Icon as typeof Users;
                return (
                  <div key={String(title)} className="rounded-[26px] border border-white/12 bg-white/8 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D0E3C4] text-[#503047]"><FeatureIcon size={18} /></div>
                    <h3 className="mt-8 font-heading text-xl font-extrabold">{String(title)}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/55">{String(copy)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="product" className="deck-slide mt-3">
          <div className="grid min-h-[78vh] items-center gap-8 rounded-[32px] bg-white px-7 py-10 sm:px-10 sm:py-12 lg:grid-cols-[0.85fr_1.15fr] lg:px-16">
            <div>
              <SlideNumber value="05 / 10" />
              <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-[#C05746]">The product</p>
              <h2 className="mt-4 font-heading text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-6xl">
                It is already a product, not just a pitch.
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-7 text-[#503047]/62 sm:text-base">
                The current V1 is live and covers the core record-keeping loop from customer and invoice creation through payment, receipt and reporting.
              </p>
              <div className="mt-7 space-y-3">
                {[
                  "Account registration, verification and business onboarding",
                  "Customer records and customer history",
                  "Sales, invoices, public invoice links and partial payments",
                  "Manual Cash, Bank Transfer and POS payment recording",
                  "Receipts, expenses and financial reports",
                ].map((item) => (
                  <div key={item} className="flex gap-3 text-sm font-semibold text-[#503047]">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-[#C05746]" size={17} /><span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <ProductMockup />
          </div>
        </section>

        <section id="workflow" className="deck-slide mt-3 rounded-[32px] bg-[#503047] text-white">
          <div className="min-h-[78vh] px-7 py-10 sm:px-10 sm:py-12 lg:px-16">
            <SlideNumber value="06 / 10" />
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <div>
                <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-[#D0E3C4]">How it works</p>
                <h2 className="mt-4 max-w-xl font-heading text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-6xl">
                  The product follows the way a business actually gets paid.
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
                The workflow keeps the customer's identity, the sale or invoice, the payment and the resulting receipt connected instead of forcing the owner to maintain separate records.
              </p>
            </div>
            <div className="mt-12 grid gap-3 lg:grid-cols-4">
              {steps.map(([number, title, copy]) => (
                <div key={number} className="rounded-[26px] border border-white/10 bg-white/5 p-6">
                  <span className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#ADC698]">{number}</span>
                  <h3 className="mt-12 font-heading text-xl font-extrabold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/50">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="advantage" className="deck-slide mt-3 grid gap-3 lg:grid-cols-2">
          <div className="rounded-[32px] bg-[#ADC698] p-8 sm:p-10 lg:p-12">
            <SlideNumber value="07 / 10" />
            <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-[#C05746]">Why OpenBooks</p>
            <h2 className="mt-4 max-w-xl font-heading text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-6xl">
              Local enough to be practical. Open enough to keep building.
            </h2>
            <div className="mt-8 space-y-4">
              {[
                ["Nigeria-first", "Designed around local business workflows and NGN-focused records."],
                ["Simple by design", "The product starts with the daily financial tasks, not accounting jargon."],
                ["Open source", "The core codebase is public and documented for inspection and contribution."],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-2xl bg-white/55 p-4">
                  <p className="font-heading text-lg font-extrabold">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#503047]/60">{copy}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[32px] bg-white p-8 sm:p-10 lg:p-12">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#C05746]">Clear boundaries build trust.</p>
            <h3 className="mt-4 font-heading text-3xl font-extrabold">What OpenBooks does not pretend to be.</h3>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#503047]/62">
              V1 does not claim to replace every accountant or every accounting system. It focuses on the everyday record-keeping layer and keeps future provider integrations explicit rather than presenting unfinished capabilities as live.
            </p>
            <div className="mt-7 rounded-[24px] bg-[#F8F8F6] p-5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#503047]/40">Current payment boundary</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {["Cash", "Bank Transfer", "POS"].map((item) => <div key={item} className="rounded-2xl bg-white px-3 py-4 text-center text-xs font-bold">{item}</div>)}
              </div>
              <p className="mt-3 text-xs leading-5 text-[#503047]/50">Paystack is documented as a future provider boundary and is not treated as active V1 payment processing.</p>
            </div>
          </div>
        </section>

        <section id="business" className="deck-slide mt-3 rounded-[32px] bg-[#F8F8F6]">
          <div className="grid min-h-[78vh] gap-10 px-7 py-10 sm:px-10 sm:py-12 lg:grid-cols-[0.8fr_1.2fr] lg:px-16">
            <div>
              <SlideNumber value="08 / 10" />
              <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-[#C05746]">Product strategy</p>
              <h2 className="mt-4 max-w-2xl font-heading text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-6xl">
                The core product is free. Sustainability is still being designed.
              </h2>
              <p className="mt-6 max-w-xl text-sm leading-7 text-[#503047]/62 sm:text-base">
                OpenBooks is intentionally free at the current stage. The product priority is reducing the barrier to keeping proper business records. Future commercial layers should grow from real user value rather than blocking the basic record-keeping workflow.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Today", "Free V1", "Give small businesses a usable financial record system without an upfront software fee."],
                ["Distribution", "Product + search", "A public product, practical guides and browser tools create multiple entry points."],
                ["Next", "Validate demand", "Learn which workflows businesses value enough to support sustainable future revenue."],
                ["Long term", "Financial operating layer", "Build beyond record keeping into useful business workflows without losing simplicity."],
              ].map(([eyebrow, title, copy]) => (
                <div key={eyebrow} className="rounded-[28px] border border-[#503047]/8 bg-white p-6">
                  <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-[#503047]/40">{eyebrow}</p>
                  <h3 className="mt-9 font-heading text-xl font-extrabold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#503047]/57">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="roadmap" className="deck-slide mt-3 rounded-[32px] bg-[#D0E3C4]">
          <div className="min-h-[78vh] px-7 py-10 sm:px-10 sm:py-12 lg:px-16">
            <SlideNumber value="09 / 10" />
            <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
              <div>
                <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-[#C05746]">Roadmap</p>
                <h2 className="mt-4 max-w-xl font-heading text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-6xl">
                  Keep the core simple. Add depth where it helps the owner make better decisions.
                </h2>
              </div>
              <div className="space-y-3">
                {[
                  ["01", "Strengthen the core", "Keep financial correctness, mobile usability, public invoice flows and documentation strong."],
                  ["02", "Validate the next workflow", "Use real product usage and conversations to decide which recurring business problem should come next."],
                  ["03", "Provider integrations", "Reintroduce payment-provider workflows through explicit, testable integration boundaries when ready."],
                  ["04", "Grow the operating layer", "Turn trusted financial records into more useful business actions without turning OpenBooks into a bloated accounting suite."],
                ].map(([number, title, copy]) => (
                  <div key={number} className="grid gap-4 rounded-[24px] bg-white p-5 sm:grid-cols-[40px_0.75fr_1.25fr] sm:items-start">
                    <span className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[#C05746]">{number}</span>
                    <h3 className="font-heading text-lg font-extrabold">{title}</h3>
                    <p className="text-sm leading-6 text-[#503047]/57">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="close" className="deck-slide mt-3 overflow-hidden rounded-[32px] bg-[#503047] text-white">
          <div className="relative grid min-h-[78vh] items-center px-7 py-12 sm:px-10 sm:py-14 lg:grid-cols-[1fr_auto] lg:px-16">
            <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-[#C05746]/25 blur-3xl" />
            <div className="relative max-w-3xl">
              <SlideNumber value="10 / 10" />
              <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-[#D0E3C4]">The ask</p>
              <h2 className="mt-4 font-heading text-5xl font-extrabold leading-[0.98] tracking-[-0.04em] sm:text-7xl">
                Help us make good financial records normal for small businesses.
              </h2>
              <p className="mt-7 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
                OpenBooks is live, open, documented and focused on a simple job: help business owners know what happened to their money without making the process harder than the work itself.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="https://www.openbooks.click" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-[#C05746] px-5 py-3.5 text-sm font-bold text-white">Open the product <ExternalLink size={16} /></Link>
                <Link href="https://github.com/awesomeakokayo/OpenBooks" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white">View the code <ExternalLink size={16} /></Link>
              </div>
            </div>
            <div className="relative mt-10 w-full max-w-[340px] lg:mt-0">
              <div className="rounded-[30px] border border-white/10 bg-white/6 p-7">
                <BookOpen className="text-[#D0E3C4]" size={28} />
                <p className="mt-8 font-heading text-2xl font-extrabold">OpenBooks</p>
                <p className="mt-2 text-sm leading-6 text-white/50">Simple bookkeeping, invoicing and payment tracking.</p>
                <div className="mt-8 border-t border-white/10 pt-5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/35">Live product</p>
                  <p className="mt-2 text-sm font-semibold text-white/80">openbooks.click</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="print-hidden mt-5 rounded-[30px] bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C05746]">Product documentation</p>
              <h3 className="mt-2 font-heading text-2xl font-extrabold">This pitch stays tied to the repository source of truth.</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#503047]/55">
                Product boundaries, feature surfaces, architecture, security rules and release notes live in the repository docs so future changes do not silently make the deck inaccurate.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="https://github.com/awesomeakokayo/OpenBooks/blob/main/docs/PITCH-DECK.md" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[#503047]/10 px-3.5 py-2.5 text-xs font-bold">Pitch deck notes <ExternalLink size={14} /></Link>
              <Link href="https://github.com/awesomeakokayo/OpenBooks/blob/main/docs/PRODUCT.md" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[#503047]/10 px-3.5 py-2.5 text-xs font-bold">Product docs <ExternalLink size={14} /></Link>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{\`
        .deck-slide { min-height: 78vh; }
        @media print {
          .deck-slide { min-height: 0; height: 185mm; break-inside: avoid; page-break-inside: avoid; page-break-after: always; }
          main { background: #fff !important; }
          body { background: #fff !important; }
        }
      \`}</style>
    </main>
  );
}
