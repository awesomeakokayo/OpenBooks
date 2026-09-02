import type { Metadata } from "next";
import { CommercialLanding } from "@/components/seo/CommercialLanding";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Receipt Software for Nigerian Small Businesses | OpenBooks",
  description: "Create payment receipts, keep customer payment history and connect receipts to the sales record with OpenBooks.",
  path: "/receipt-software-nigeria",
});

export default function Page() {
  return <CommercialLanding eyebrow="Receipt software for Nigeria" title="Give customers proof of payment without losing the record behind it." description="Create receipts after payment, keep payment history organized and connect the receipt to the customer and transaction." answer="A useful receipt workflow confirms that money was received while preserving the transaction that produced it. OpenBooks keeps the receipt, customer and payment history connected instead of treating the receipt as a standalone file." audience="Retailers, service businesses, freelancers and Nigerian small businesses" features={[{ title: "Payment receipts", copy: "Create a clear record of what was paid, by whom and for which transaction." }, { title: "Customer history", copy: "Keep receipts connected to the customer's broader payment and transaction history." }, { title: "Payment methods", copy: "Record whether a customer paid by transfer, cash, POS or another enabled method." }, { title: "Partial payments", copy: "Keep payment events separate when a customer settles a balance in more than one step." }, { title: "Sales context", copy: "Use payment records alongside sales instead of treating receipts as isolated documents." }, { title: "Free starting point", copy: "Create a receipt with the free tool before moving into the full OpenBooks workflow." }]} workflow={["Record the sale or transaction.","Receive the customer's full or partial payment.","Record the payment method and amount.","Provide the receipt as proof of payment.","Keep the receipt and payment history connected to the customer and transaction."]} related={[{ href: "/tools/receipt-generator", label: "Try the free receipt generator" }, { href: "/guides/invoice-vs-receipt", label: "Invoice vs receipt" }, { href: "/invoice-software-nigeria", label: "Invoice software for Nigeria" }]} />;
}
