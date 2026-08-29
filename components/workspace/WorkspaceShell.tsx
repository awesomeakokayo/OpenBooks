import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { WorkspaceNavigation } from "./WorkspaceNavigation";

export async function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id?: string }).id;
  if (!userId) redirect("/login");

  const member = await prisma.businessMember.findFirst({
    where: { userId },
    include: { business: true },
  });

  if (!member) redirect("/create-business");

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-plum">
      <div className="flex min-h-screen">
        <WorkspaceNavigation businessName={member.business.name} firstName={firstName} />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
