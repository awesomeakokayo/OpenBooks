import type { Metadata } from "next";
import { CommercialLanding } from "@/components/seo/CommercialLanding";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Sales Tracking Software for Small Businesses | OpenBooks",
  description: "Record daily sales, track payment status and customer balances, and review business sales in one place with OpenBooks.",
  path: "/sales-tracking-software",
});

export default function Page() {
  return <CommercialLanding eyebrow="Sales tracking" title="Know what your business sold today." description="Track daily sales, payment status and customer balances without relying on scattered notebooks, spreadsheets or chat messages." answer="Sales tracking works best when every sale has a consistent record and later payments are connected to the original transaction. OpenBooks keeps that history together so your totals stay meaningful." audience="Retailers, service businesses, freelancers and small teams" features={[{ title: "Fast sale records", copy: "Capture the customer, item or service, amount and payment status while the transaction is fresh." }, { title: "Cash and credit sales", copy: "Keep immediate payments separate from credit sales so later payments do not become duplicate sales." }, { title: "Customer history", copy: "See purchases, payments and balances together for each customer." }, { title: "Payment tracking", copy: "Record when a customer pays and keep the payment history connected to the sale." }, { title: "Daily visibility", copy: "Review recorded sales and collected amounts without waiting until month end." }, { title: "Profit-ready records", copy: "Combine sales with expenses so your business records can support profit calculations." }]} workflow={["Record the sale when it happens.","Mark whether it was paid immediately or remains outstanding.","For credit sales, keep the original sale intact and add later payments separately.","Review daily sales and collected amounts against your actual payment channels.","Use the same records for customer balances and profit review."]} related={[{ href: "/guides/how-to-track-daily-sales", label: "How to track daily sales" }, { href: "/guides/cash-sales-vs-credit-sales", label: "Cash sales vs credit sales" }, { href: "/tools/profit-calculator", label: "Free profit calculator" }]} />;
}
