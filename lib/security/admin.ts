import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  const allowed = (process.env.OPENBOOKS_ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (!email || !allowed.includes(email)) {
    throw new Error("FORBIDDEN");
  }

  return session;
}
