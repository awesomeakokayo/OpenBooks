import type { Metadata } from "next";
import { CommercialLanding } from "@/components/seo/CommercialLanding";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Expense Tracker for Small Businesses | OpenBooks",
  description: "Track business expenses, payment details and spending patterns with a simple expense tracker for small businesses and freelancers.",
  path: "/expense-tracker-small-business",
});

export default function Page() {
  return <CommercialLanding eyebrow="Expense tracking" title="See where the business money is going." description="Record business spending, keep supporting details and review expenses alongside your sales so profit is based on real records." answer="An expense tracker is most useful when it captures the basic facts of each transaction and keeps business spending separate from personal spending. OpenBooks makes those records part of the same system as your sales and customers." audience="Small businesses, freelancers, consultants and owner-managed businesses" features={[{ title: "Expense records", copy: "Capture the date, amount, payee, purpose and payment method for each business expense." }, { title: "Supporting proof", copy: "Keep useful receipt or payment references with the expense record when available." }, { title: "Business vs personal", copy: "Keep operating costs separate from personal spending so business results are easier to interpret." }, { title: "Spending visibility", copy: "Review recurring and unexpected costs instead of discovering them after money has already gone." }, { title: "Connected profit view", copy: "Use expenses alongside sales when reviewing gross profit, net profit and margin." }, { title: "Simple daily workflow", copy: "Add an expense close to the time it happens so month-end cleanup is smaller." }]} workflow={["Record the expense while the details are still easy to verify.","Capture the amount, payee, purpose and payment method.","Keep supporting proof or a useful payment reference where available.","Review recurring costs and unusual spending regularly.","Compare expenses with sales to understand the business result."]} related={[{ href: "/guides/how-to-track-business-expenses", label: "How to track business expenses" }, { href: "/guides/how-to-calculate-small-business-profit", label: "How to calculate small business profit" }, { href: "/for-businesses", label: "OpenBooks for businesses" }]} />;
}
