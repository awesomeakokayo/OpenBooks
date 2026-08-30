import { userError } from "@/lib/security/error";

/** Paystack webhooks are intentionally disabled while Paystack is deferred from V1. */
export async function POST() {
  return userError("Paystack webhooks are not enabled for OpenBooks V1", 410);
}
