import type { Metadata } from "next";
import { CommercialLanding } from "@/components/seo/CommercialLanding";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Customer Debt Tracker for Small Businesses | OpenBooks",
  description: "Track customers who owe you money, partial payments, due amounts and payment history with OpenBooks.",
  path: "/customer-debt-tracker",
});

export default function Page() {
  return <CommercialLanding eyebrow="Customer balances" title="Stop losing track of who still owes you." description="Keep credit sales, invoices, partial payments and outstanding customer balances connected in one place." answer="A customer debt tracker should show where the balance came from, what the customer has already paid and what remains. OpenBooks keeps the original transaction and later payments connected so balances are easier to follow up." audience="Businesses that sell on credit, freelancers, service providers and retailers" features={[{ title: "Outstanding balances", copy: "See the amount still due instead of recalculating it from old chats and receipts." }, { title: "Partial payments", copy: "Record each payment separately so the remaining balance stays accurate." }, { title: "Invoice connection", copy: "Keep the invoice or transaction that created the balance attached to the customer's history." }, { title: "Payment history", copy: "Know when payments happened and how much has already been collected." }, { title: "Customer-first records", copy: "Review the full relationship with a customer instead of looking at isolated transactions." }, { title: "Better follow-up", copy: "Use clear due amounts and dates to make payment reminders more systematic." }]} workflow={["Record the full credit sale and agree the payment terms.","Create an invoice when a formal payment request is useful.","Record each full or partial payment against the original transaction.","Review outstanding balances regularly and prioritize overdue amounts.","Keep the customer's history available for future sales and follow-up."]} related={[{ href: "/guides/how-to-track-customers-who-owe-you", label: "How to track customers who owe you" }, { href: "/tools/invoice-generator", label: "Free invoice generator" }, { href: "/guides/cash-sales-vs-credit-sales", label: "Cash sales vs credit sales" }]} />;
}
