import type { Metadata } from "next";
import { CommercialLanding } from "@/components/seo/CommercialLanding";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Online Invoice Maker for Nigeria | OpenBooks",
  description: "Make and send clear invoices online, track payments and keep customer balances organized with OpenBooks.",
  path: "/online-invoice-maker-nigeria",
});

export default function Page() {
  return <CommercialLanding eyebrow="Online invoice maker" title="Make an invoice online, then keep the transaction organized." description="Create a professional invoice for a Nigerian customer and keep the sale, payment and outstanding balance connected after you send it." answer="An online invoice maker is most useful when it does not stop at the document. OpenBooks connects invoicing with customer records, payment history and outstanding balances so the invoice becomes part of a reliable business record." audience="Freelancers, service providers, retailers and small businesses in Nigeria" features={[{ title: "Create quickly", copy: "Add the customer, work, amount and due date without building a complicated accounting workflow." }, { title: "Share digitally", copy: "Send the invoice through the channels your customer already uses." }, { title: "Track settlement", copy: "Record when payment arrives and keep the payment history connected to the original transaction." }, { title: "See what remains", copy: "Keep outstanding balances visible when a customer has not paid in full." }, { title: "Receipts after payment", copy: "Keep proof of payment with the transaction instead of treating the invoice as the end of the process." }, { title: "Works with your records", copy: "Use invoice activity alongside your sales and customer records in OpenBooks." }]} workflow={["Choose or add the customer.","Add the goods or service, amount and payment terms.","Share the invoice online.","Record the full or partial payment when it arrives.","Review the customer balance and transaction history when you need to follow up."]} related={[{ href: "/invoice-software-nigeria", label: "Invoice software for Nigerian businesses" }, { href: "/tools/invoice-generator", label: "Try the free invoice generator" }, { href: "/guides/invoice-vs-receipt", label: "Invoice vs receipt" }]} />;
}
