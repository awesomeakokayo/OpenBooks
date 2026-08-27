import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { CreateBusinessForm } from "./CreateBusinessForm";

export default async function CreateBusinessPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as unknown as { id: string }).id;
  const existing = userId ? await prisma.businessMember.findFirst({ where: { userId } }) : null;
  if (existing) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="mx-auto flex w-full max-w-[1320px] items-center gap-2 px-6 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-plum text-sm font-bold text-white">
          OB
        </div>
        <span className="font-heading text-lg font-bold text-plum">OpenBooks NG</span>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-[560px] rounded-[20px] border border-plum/10 bg-white p-8 shadow-[0_12px_40px_rgba(80,48,71,0.08)]">
          <h1 className="font-heading text-2xl font-bold text-plum">Let&apos;s set up your business</h1>
          <p className="mt-1 text-sm text-plum/60">What&apos;s your business called? Customers will see this on invoices.</p>
          <div className="mt-6">
            <CreateBusinessForm />
          </div>
        </div>
      </main>
    </div>
  );
}
