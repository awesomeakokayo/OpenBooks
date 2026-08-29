import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { PaymentSettingsForm } from "./PaymentSettingsForm";
import { BusinessProfileForm } from "./BusinessProfileForm";

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
        <p className="mt-1 text-sm text-plum/60">Manage the business information customers see and the payment methods you accept.</p>
      </div>

      <div className="rounded-[16px] border border-plum/10 bg-white p-6">
        <div>
          <h2 className="font-heading text-sm font-bold text-plum">Business profile</h2>
          <p className="mt-1 text-xs leading-5 text-plum/50">These details appear on invoices and receipts.</p>
        </div>
        <BusinessProfileForm
          businessId={business.id}
          initial={{
            name: business.name,
            phone: business.phone,
            email: business.email,
            address: business.address,
            description: business.description,
          }}
        />
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
