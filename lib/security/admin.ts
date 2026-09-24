import { auth } from "@/auth";

const DEFAULT_ADMIN_EMAILS = ["awesomeakokayo@gmail.com"];

export async function requireAdmin() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  const configured = (process.env.OPENBOOKS_ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const allowed = configured.length ? configured : DEFAULT_ADMIN_EMAILS;

  if (!email || !allowed.includes(email)) {
    throw new Error("FORBIDDEN");
  }

  return session;
}
