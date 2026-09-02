import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createPageMetadata } from "@/lib/seo/metadata";
import { SITE_NAME, SITE_URL } from "@/lib/seo/site";

type Guide = {
  title: string;
  description: string;
  category: string;
  intro: string;
  sections: Array<{ heading: string; paragraphs: string[]; bullets?: string[] }>;
  related: Array<{ href: string; label: string }>;
};

const GUIDES: Record<string, Guide> = {
  "how-to-create-an-invoice-in-nigeria": {
    title: "How to Create an Invoice in Nigeria",
    description: "A practical step-by-step guide to creating a clear invoice for a Nigerian customer and keeping the payment record afterward.",
    category: "Invoicing",
    intro: "An invoice tells a customer what they owe, what the charge is for, and when payment is expected. For a small business, the goal is not to make the document complicated; it is to make the transaction clear and easy to follow from request to payment.",
    sections: [
      {
        heading: "What to put on an invoice",
        paragraphs: ["Start with the basics that let both sides identify the transaction. Use your business name and contact details, the customer's name or business, an invoice number, the issue date and a clear description of what you are charging for.", "Show each item or service separately where that makes the charge easier to understand. State the quantity, unit price and total, then make the amount due obvious."],
        bullets: ["Business name and contact details", "Customer name and contact details", "Invoice number and date", "Items or services supplied", "Quantity, price and total amount", "Payment method or account details", "Due date or payment terms"],
      },
      {
        heading: "A simple invoice workflow",
        paragraphs: ["Create the invoice before or when you confirm the sale. Send it through a channel your customer already uses, such as email or a messaging app, and keep the same invoice number when discussing the payment.", "When the customer pays, record the payment against that transaction. That final step matters because an invoice tells you what should be paid while the payment record tells you what was actually received."],
      },
      {
        heading: "Avoid these common mistakes",
        paragraphs: ["Do not hide the total inside a paragraph or make the customer calculate it themselves. Do not reuse ambiguous invoice numbers, and do not leave paid invoices looking unpaid. A clear status and payment history make follow-up much easier."],
      },
    ],
    related: [
      { href: "/tools/invoice-generator", label: "Create an invoice with the free invoice generator" },
      { href: "/guides/invoice-vs-receipt", label: "Invoice vs receipt" },
      { href: "/guides/how-to-track-customers-who-owe-you", label: "Track customers who owe you" },
    ],
  },
  "invoice-vs-receipt": {
    title: "Invoice vs Receipt: What Is the Difference?",
    description: "Understand the difference between an invoice and a receipt, when to use each, and how they fit into a simple sales record.",
    category: "Invoicing",
    intro: "An invoice and a receipt are related, but they answer different questions. An invoice communicates what a customer is expected to pay. A receipt confirms that a payment was received.",
    sections: [
      {
        heading: "What an invoice does",
        paragraphs: ["An invoice is useful when there is an amount due. It explains the items or service, the amount charged and the terms for payment. It can be sent before payment, immediately after a sale, or whenever you need a formal request for payment."],
      },
      {
        heading: "What a receipt does",
        paragraphs: ["A receipt is proof that money was received. It should identify the customer, the transaction, the amount paid and the date or payment reference where useful. A receipt can follow an invoice, but it can also be used for a straightforward sale that is paid immediately."],
      },
      {
        heading: "The easiest way to remember it",
        paragraphs: ["Think of the invoice as the amount the customer should pay and the receipt as evidence that the customer has paid. For credit sales, keep both records connected so you can see the original amount, payments received and any balance still outstanding."],
      },
    ],
    related: [
      { href: "/tools/receipt-generator", label: "Create a free receipt" },
      { href: "/tools/invoice-generator", label: "Create a free invoice" },
      { href: "/guides/how-to-track-customers-who-owe-you", label: "Track customer balances" },
    ],
  },
  "how-to-track-daily-sales": {
    title: "How to Track Daily Sales for a Small Business",
    description: "A simple daily sales tracking workflow for shops, service businesses, freelancers and other small businesses.",
    category: "Sales",
    intro: "You do not need a complicated accounting system to know how much you sold today. You need a consistent record of each sale and a way to review totals by day, payment status and customer.",
    sections: [
      {
        heading: "Record every sale close to the time it happens",
        paragraphs: ["For each sale, capture the date, customer if known, what was sold, the amount and how the customer paid or is expected to pay. Recording this immediately reduces the end-of-day guessing that happens when sales are scattered across memory, notebooks and chat messages."],
      },
      {
        heading: "Separate sales from payments",
        paragraphs: ["A cash sale paid immediately is simple, but credit sales need more care. Record the sale as a transaction and separately record the later payment. That way you can calculate sales without accidentally counting a later payment as a second sale."],
      },
      {
        heading: "Review a simple daily summary",
        paragraphs: ["At the end of the day, review the number of transactions, total sales, amount collected and amount still outstanding. Compare that with what is physically in your cash, bank or payment channels. Small differences are much easier to investigate when the underlying transactions are already recorded."],
      },
    ],
    related: [
      { href: "/tools/profit-calculator", label: "Calculate business profit" },
      { href: "/guides/how-to-track-business-expenses", label: "Track business expenses" },
      { href: "/for-businesses", label: "OpenBooks for businesses" },
    ],
  },
  "how-to-track-business-expenses": {
    title: "How to Track Business Expenses",
    description: "Learn a practical way to record business spending, separate business costs from personal spending, and review where money goes.",
    category: "Expenses",
    intro: "Expense tracking answers a simple question: where did the business money go? A useful system captures the cost, date, reason, payee and payment method while the information is still easy to verify.",
    sections: [
      {
        heading: "Record the details that matter",
        paragraphs: ["For each expense, save the date, amount, supplier or payee, what the money was for and how it was paid. Keep the related receipt or proof of payment when one exists."],
        bullets: ["Date", "Amount", "Supplier or payee", "Expense category or purpose", "Payment method", "Receipt or payment reference"],
      },
      {
        heading: "Keep business and personal spending separate",
        paragraphs: ["Mixing household spending with business costs makes profit harder to understand. Use a clear business category for business purchases and record any owner withdrawals or personal spending separately instead of disguising them as operating expenses."],
      },
      {
        heading: "Review expenses regularly",
        paragraphs: ["A weekly review can reveal recurring subscriptions, rising supplier costs and small purchases that add up. The goal is not only to store receipts; it is to turn them into information you can use to make decisions."],
      },
    ],
    related: [
      { href: "/tools/profit-calculator", label: "Use the profit calculator" },
      { href: "/guides/how-to-calculate-small-business-profit", label: "Calculate small business profit" },
      { href: "/for-businesses", label: "Manage your business records with OpenBooks" },
    ],
  },
  "how-to-calculate-small-business-profit": {
    title: "How to Calculate Small Business Profit",
    description: "Learn how to calculate gross profit, net profit and profit margin using sales, direct costs and other business expenses.",
    category: "Profit",
    intro: "Profit is what remains after the costs of running the business are accounted for. A simple profit calculation becomes much more useful when you separate the cost of making or delivering a sale from other business expenses.",
    sections: [
      {
        heading: "Start with total sales",
        paragraphs: ["Add the sales recorded for the period you are reviewing. Be consistent about the period—daily, weekly or monthly—and do not count a payment twice just because it settled after the original sale."],
      },
      {
        heading: "Calculate gross profit",
        paragraphs: ["Gross profit is sales minus the direct costs associated with those sales. For a product business, that may include inventory or materials used to make the item. For a service business, direct costs may be the costs that are specifically tied to delivering the service."],
      },
      {
        heading: "Calculate net profit",
        paragraphs: ["Net profit goes further by subtracting the other business expenses for the same period. A simple version is: net profit = gross profit − operating expenses. Profit margin is net profit divided by sales, expressed as a percentage."],
      },
      {
        heading: "Use consistent numbers",
        paragraphs: ["The calculation is only as useful as the records behind it. Keep sales and expenses in the same period, avoid mixing personal spending into business expenses and review unusual transactions before making decisions from the result."],
      },
    ],
    related: [
      { href: "/tools/profit-calculator", label: "Calculate profit instantly" },
      { href: "/guides/how-to-track-daily-sales", label: "Track daily sales" },
      { href: "/guides/how-to-track-business-expenses", label: "Track business expenses" },
    ],
  },
  "how-to-track-customers-who-owe-you": {
    title: "How to Track Customers Who Owe You Money",
    description: "Build a simple customer-balance workflow so credit sales, due amounts and payments do not disappear in chat messages or notebooks.",
    category: "Customers",
    intro: "When a customer buys on credit, the sale is not finished just because the product or service has been delivered. You need a clear record of the original transaction, the amount paid and the balance that remains.",
    sections: [
      {
        heading: "Start with the original transaction",
        paragraphs: ["Record the customer, date, items or service, total amount and agreed payment terms. Give the transaction a reference such as an invoice number so future conversations can point to the same record."],
      },
      {
        heading: "Record every payment against the balance",
        paragraphs: ["When a customer pays part of the amount, record the payment separately and let the balance reduce from the original amount. Partial payments are easier to manage when the history is visible instead of overwriting the original sale."],
      },
      {
        heading: "Create a follow-up rhythm",
        paragraphs: ["Review outstanding balances on a predictable schedule. Prioritize overdue balances, confirm the amount still outstanding and keep a record of follow-up. This turns debt collection from memory work into a repeatable process."],
      },
    ],
    related: [
      { href: "/tools/invoice-generator", label: "Create an invoice" },
      { href: "/guides/how-to-create-an-invoice-in-nigeria", label: "Learn a simple invoice workflow" },
      { href: "/for-customers", label: "How customers use OpenBooks" },
    ],
  },
};

const slugs = Object.keys(GUIDES);

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES[slug];
  if (!guide) return {};
  return createPageMetadata({ title: guide.title, description: guide.description, path: `/guides/${slug}` });
}

export default async function GuideArticlePage({ params }: Props) {
  const { slug } = await params;
  const guide = GUIDES[slug];
  if (!guide) return null;

  const canonical = `${SITE_URL}/guides/${slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    mainEntityOfPage: canonical,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <main className="min-h-screen bg-[#F8F8F6] text-plum">
      <header className="border-b border-plum/10 bg-plum text-white">
        <div className="mx-auto flex max-w-[900px] items-center justify-between px-5 py-5 lg:px-8">
          <Link href="/" className="font-heading text-xl font-bold text-white">{SITE_NAME}</Link>
          <Link href="/guides" className="text-sm font-semibold text-white/70 hover:text-white">All guides</Link>
        </div>
      </header>

      <article className="mx-auto max-w-[900px] px-5 pb-20 pt-14 lg:px-8 lg:pb-28 lg:pt-20">
        <p className="openbooks-eyebrow text-terracotta">{guide.category}</p>
        <h1 className="mt-4 font-heading text-[clamp(2.7rem,6vw,5.3rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">{guide.title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-plum/65">{guide.intro}</p>

        <div className="mt-12 space-y-10">
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-heading text-2xl font-extrabold sm:text-3xl">{section.heading}</h2>
              <div className="mt-4 space-y-4 text-base leading-8 text-plum/70">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              {section.bullets ? (
                <ul className="mt-5 space-y-2 pl-5 text-base leading-7 text-plum/70">
                  {section.bullets.map((bullet) => <li key={bullet} className="list-disc">{bullet}</li>)}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-plum p-7 text-white sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-pale-sage">Next step</p>
          <h2 className="mt-2 font-heading text-2xl font-extrabold">Put the workflow into practice with OpenBooks.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Record sales, manage customers, create invoices and keep payment history in one place.</p>
          <Link href="/register" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-terracotta px-5 py-3 text-sm font-bold text-white">Start for free <ArrowRight size={16} /></Link>
        </div>

        <nav aria-label="Related guides and tools" className="mt-9 flex flex-wrap gap-x-5 gap-y-3 text-sm">
          {guide.related.map((item) => <Link key={item.href} href={item.href} className="font-semibold text-plum/60 underline decoration-plum/10 underline-offset-4 hover:text-terracotta">{item.label}</Link>)}
        </nav>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </main>
  );
}
