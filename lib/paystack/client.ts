import crypto from "crypto";

const PAYSTACK_BASE = "https://api.paystack.co";

function secret(): string {
  const s = process.env.PAYSTACK_SECRET_KEY;
  if (!s) throw new Error("PAYSTACK_SECRET_KEY not set");
  return s;
}

export type PaystackInitParams = {
  amountKobo: number;
  email: string;
  reference: string;
  callbackUrl: string;
  subaccount?: string | null;
  metadata?: Record<string, unknown>;
};

export async function initializeTransaction(params: PaystackInitParams) {
  const body: Record<string, unknown> = {
    amount: params.amountKobo,
    email: params.email,
    reference: params.reference,
    callback_url: params.callbackUrl,
    metadata: params.metadata,
  };
  if (params.subaccount) {
    body.subaccount = params.subaccount;
    // bearer defaults to subaccount; Paystack will settle to subaccount
  }
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data.message || "Paystack initialize failed");
  }
  return data.data as { authorization_url: string; access_code: string; reference: string };
}

export async function verifyTransaction(reference: string) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret()}` },
  });
  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data.message || "Paystack verify failed");
  }
  return data.data as {
    status: string;
    reference: string;
    amount: number; // kobo
    currency: string;
    gateway_response: string;
    paid_at?: string;
    metadata?: Record<string, unknown>;
    customer?: { email: string };
  };
}

export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const hash = crypto.createHmac("sha512", secret()).update(rawBody).digest("hex");
  // timing-safe compare
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}
