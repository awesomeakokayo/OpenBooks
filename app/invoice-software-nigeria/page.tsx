import type { Metadata } from "next";
import { CommercialLanding } from "@/components/seo/CommercialLanding";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Invoice Software for Nigerian Small Businesses | OpenBooks",
  description: "Create professional invoices, track payments and customer balances, and keep your sales records together with OpenBooks.",
  path: "/invoice-software-nigeria",
});

export default function Page() {
  return <CommercialLanding eyebrow="Invoice software for Nigeria" title="Send invoices without making bookkeeping complicated." description="OpenBooks helps Nigerian small businesses and freelancers create invoices, collect payments, record sales and see what customers still owe." answer="For a small business, good invoice software should do more than produce a document. It should connect the invoice to the customer, payment and outstanding balance so the transaction stays understandable after the invoice is sent." audience="Nigerian small businesses, freelancers and service providers" features={[{ title: "Professional invoices", copy: "Create clear invoices with the customer, items, amount and payment details in one document." }, { title: "Payment history", copy: "Record payments against the transaction so paid and outstanding amounts stay clear." }, { title: "Customer balances", copy: "See what customers have paid and what they still owe instead of calculating balances manually." }, { title: "Multiple payment methods", copy: "Use the payment methods that fit your business, including bank transfer, cash, POS and Paystack where enabled." }, { title: "Sales records", copy: "Keep invoice activity connected to your broader sales history instead of storing it in separate places." }, { title: "Mobile-friendly workflow", copy: "Handle everyday invoicing and record keeping from a phone-friendly workspace." }]} workflow={["Add the customer once and keep their transaction history together.","Create an invoice with the work, amount and due date.","Send the invoice through the channel your customer already uses.","Record the payment when it arrives and keep the receipt history with the transaction.","Review outstanding balances and follow up without rebuilding the numbers."]} related={[{ href: "/tools/invoice-generator", label: "Try the free invoice generator" }, { href: "/guides/how-to-create-an-invoice-in-nigeria", label: "How to create an invoice in Nigeria" }, { href: "/for-businesses", label: "OpenBooks for business owners" }]} />;
}
