import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { PaymentSettingsForm } from "./PaymentSettingsForm";

export default async function BusinessSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as unknown as { id: string }).id;
  const member = await prisma.businessMember.findFirst({
    where: { userId },
    include: { business: { include: { paymentSetting: true } } },
  });
  if (!member) redirect("/create-business");
  const business = member.business;
  const setting = business.paymentSetting;

  return (
    <div className="mx-auto max-w-[760px] flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-plum">Business settings</h1>
        <p className="mt-1 text-sm text-plum/60">{business.name} • Manage your business profile and payment methods.</p>
      </div>

      <div className="rounded-[16px] border border-plum/10 bg-white p-6">
        <h2 className="font-heading text-sm font-bold text-plum">Business profile</h2>
        <div className="mt-3 grid gap-3 text-sm">
          <div className="flex justify-between border-b border-plum/10 py-2">
            <span className="text-plum/60">Name</span>
            <span className="font-semibold text-plum">{business.name}</span>
          </div>
          <div className="flex justify-between border-b border-plum/10 py-2">
            <span className="text-plum/60">Phone</span>
            <span className="font-semibold text-plum">{business.phone}</span>
          </div>
          <div className="flex justify-between border-b border-plum/10 py-2">
            <span className="text-plum/60">Currency</span>
            <span className="font-semibold text-plum">{business.currency}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-plum/60">Address</span>
            <span className="font-semibold text-plum">{business.address || "—"}</span>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] border border-plum/10 bg-white p-6">
        <h2 className="font-heading text-sm font-bold text-plum">How do you want to get paid?</h2>
        <p className="mt-1 text-xs text-plum/50">
          Choose the payment methods customers will see. You can change this per invoice later.
        </p>
        <div className="mt-6">
          <PaymentSettingsForm businessId={business.id} initial={setting} />
        </div>
      </div>
    </div>
  );
}
