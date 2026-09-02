import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/seo/ToolShell";
import { InvoiceGenerator, ProfitCalculator, ReceiptGenerator } from "@/components/seo/ToolsInteractive";
import { createPageMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/site";

const TOOL_CONFIG = {
  "invoice-generator": {
    title: "Free Invoice Generator for Nigeria",
    description: "Create a professional Nigerian invoice in seconds. Add your customer, service and amount, then print or save the invoice as a PDF.",
    eyebrow: "Free invoice tool",
    component: InvoiceGenerator,
    related: [{ href: "/guide", label: "How to create an invoice" }, { href: "/for-businesses", label: "Bookkeeping for Nigerian businesses" }, { href: "/tools/receipt-generator", label: "Free receipt generator" }],
  },
  "receipt-generator": {
    title: "Free Receipt Generator for Nigeria",
    description: "Create a simple payment receipt for your customer. Record who paid, what they paid for, the amount and payment method, then print or save it.",
    eyebrow: "Free receipt tool",
    component: ReceiptGenerator,
    related: [{ href: "/tools/invoice-generator", label: "Free invoice generator" }, { href: "/for-businesses", label: "OpenBooks for businesses" }, { href: "/guide", label: "Learn OpenBooks" }],
  },
  "profit-calculator": {
    title: "Small Business Profit Calculator",
    description: "Calculate gross profit, net profit and net profit margin from your sales, direct costs and other business expenses.",
    eyebrow: "Free profit tool",
    component: ProfitCalculator,
    related: [{ href: "/for-businesses", label: "Keep business records with OpenBooks" }, { href: "/tools/invoice-generator", label: "Create an invoice" }, { href: "/guide", label: "Learn OpenBooks" }],
  },
} as const;

type ToolKey = keyof typeof TOOL_CONFIG;

type Props = { params: Promise<{ tool: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool } = await params;
  const config = TOOL_CONFIG[tool as ToolKey];
  if (!config) return {};
  return createPageMetadata({ title: config.title, description: config.description, path: `/tools/${tool}` });
}

export function generateStaticParams() {
  return Object.keys(TOOL_CONFIG).map((tool) => ({ tool }));
}

export default async function ToolPage({ params }: Props) {
  const { tool } = await params;
  const config = TOOL_CONFIG[tool as ToolKey];
  if (!config) notFound();
  const Tool = config.component;
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: config.title,
    description: config.description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${SITE_URL}/tools/${tool}`,
    isAccessibleForFree: true,
    provider: { "@type": "Organization", name: "OpenBooks", url: SITE_URL },
  };

  return (
    <>
      <ToolShell eyebrow={config.eyebrow} title={config.title} description={config.description} related={config.related}>
        <Tool />
      </ToolShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
