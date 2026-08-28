import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { CreateBusinessForm } from "./CreateBusinessForm";
import { OpenBooksBrandMark } from "@/components/openbooks-brand-mark";

export default async function CreateBusinessPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as unknown as { id?: string }).id;
  if (!userId) redirect("/login");

  const existing = await prisma.businessMember.findFirst({ where: { userId } });
  if (existing) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F8F6]">
      <header className="mx-auto flex w-full max-w-[1320px] items-center justify-between px-5 py-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <OpenBooksBrandMark size={34} />
          <span className="font-heading text-lg font-bold tracking-tight text-plum">OpenBooks</span>
        </Link>
        <span className="text-xs font-semibold text-plum/40">Step 1 of 2</span>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10 lg:px-8 lg:py-14">
        <div className="w-full max-w-[620px] rounded-[32px] border border-plum/10 bg-white p-7 shadow-[0_25px_70px_rgba(80,48,71,0.10)] sm:p-9 lg:p-10">
          <p className="openbooks-eyebrow text-terracotta">Business setup</p>
          <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-[-0.04em] text-plum sm:text-4xl">Let&apos;s set up your business.</h1>
          <p className="mt-3 max-w-[48ch] text-sm leading-6 text-plum/55">Add the details customers should see when you send an invoice or receipt, then choose how you want to receive payments.</p>
          <div className="mt-8"><CreateBusinessForm /></div>
        </div>
      </main>
    </div>
  );
}
