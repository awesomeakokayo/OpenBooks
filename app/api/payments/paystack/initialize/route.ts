import { userError } from "@/lib/security/error";

/** Paystack is intentionally deferred from OpenBooks V1. */
export async function POST() {
  return userError("Paystack payments are not available in OpenBooks V1", 410);
}
