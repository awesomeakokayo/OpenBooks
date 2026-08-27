"use client";

import { useState } from "react";

export function PayOnlineButton({ invoiceToken, amount }: { invoiceToken: string; amount: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/payments/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not start payment");
        setLoading(false);
        return;
      }
      // Redirect to Paystack checkout
      window.location.href = data.authorization_url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Network error");
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 rounded-[12px] bg-pale-sage p-4">
      <p className="text-sm font-bold text-plum">Pay Online</p>
      <p className="text-xs text-plum/60">Secure payment via Paystack.</p>
      {error && <p className="mt-2 text-xs text-terracotta">{error}</p>}
      <button
        onClick={handlePay}
        disabled={loading}
        className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-[12px] bg-plum px-6 text-sm font-semibold text-white hover:bg-plum/90 disabled:opacity-60"
      >
        {loading ? "Preparing…" : `Pay ₦${amount.toLocaleString("en-NG")}`}
      </button>
      <p className="mt-2 text-xs text-plum/40">You will be redirected to Paystack Checkout.</p>
    </div>
  );
}
