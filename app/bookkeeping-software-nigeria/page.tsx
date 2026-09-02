import type { Metadata } from "next";
import { CommercialLanding } from "@/components/seo/CommercialLanding";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Simple Bookkeeping Software for Nigeria | OpenBooks",
  description: "Track sales, expenses, invoices, payments and customer balances with simple bookkeeping software built for Nigerian small businesses.",
  path: "/bookkeeping-software-nigeria",
});

export default function Page() {
  return <CommercialLanding eyebrow="Bookkeeping software for Nigeria" title="Simple bookkeeping for the way small businesses actually work." description="OpenBooks brings sales, expenses, customers, invoices and payments into one straightforward workspace for Nigerian businesses." answer="You do not need a complex accounting system just to know what you sold, what you spent and who still owes you. OpenBooks is designed around those everyday records first." audience="Shops, service businesses, freelancers, consultants and growing Nigerian businesses" features={[{ title: "Sales tracking", copy: "Record sales consistently and review totals without rebuilding them from notebooks or messages." }, { title: "Expense tracking", copy: "Keep business spending visible so you can understand where money is going." }, { title: "Customers", copy: "Keep customer details, transaction history and outstanding balances together." }, { title: "Invoices and payments", copy: "Create invoices, record payments and keep the settlement history attached to the transaction." }, { title: "Business totals", copy: "Use clear sales, expense and balance information to understand the state of the business." }, { title: "Built for small teams", copy: "Keep the workflow focused on the records a small business needs every day." }]} workflow={["Set up the business and choose the payment methods you use.","Add customers and keep their transaction history in one place.","Record sales and expenses as they happen.","Invoice customers when needed and record payments when they arrive.","Review sales, expenses, balances and profit with a consistent set of records."]} related={[{ href: "/guides/small-business-bookkeeping-nigeria", label: "Small business bookkeeping in Nigeria" }, { href: "/guides/how-to-track-business-expenses", label: "How to track business expenses" }, { href: "/guides/how-to-track-daily-sales", label: "How to track daily sales" }]} />;
}
