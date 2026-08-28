import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { OnboardingPaymentsForm } from "./OnboardingPaymentsForm";

export default async function PaymentOnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as unknown as { id?: string }).id;
  if (!userId) redirect("/login");

  const member = await prisma.businessMember.findFirst({
    where: { userId, role: "OWNER" },
    include: { business: { include: { paymentSetting: true } } },
  });

  if (!member) redirect("/create-business");

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#503047]">
      <header className="mx-auto flex w-full max-w-[1320px] items-center justify-between px-5 py-5 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#503047] text-sm font-bold text-white">OB</div>
          <span className="font-heading text-lg font-bold tracking-tight">OpenBooks</span>
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#918A91]">Step 2 of 2</span>
      </header>

      <main className="flex min-h-[calc(100vh-88px)] items-center justify-center px-5 py-10">
        <div className="w-full max-w-[620px] rounded-[32px] border border-[#E5E3DF] bg-white p-7 shadow-[0_25px_70px_rgba(80,48,71,0.09)] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C05746]">Payment setup</p>
          <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-[-0.04em]">How do customers pay you?</h1>
          <p className="mt-3 max-w-[48ch] text-sm leading-6 text-[#6F6670]">
            Choose the payment methods your business accepts. Customers will only see the methods you enable on their invoices.
          </p>
          <div className="mt-8">
            <OnboardingPaymentsForm businessId={member.business.id} initial={member.business.paymentSetting} />
          </div>
        </div>
      </main>
    </div>
  );
}
