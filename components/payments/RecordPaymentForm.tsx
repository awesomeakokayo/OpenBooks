"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RecordPaymentForm({
  businessId,
  invoiceId,
  customerId,
  outstanding,
  onPaid,
}: {
  businessId: string;
  invoiceId?: string;
  customerId: string;
  outstanding?: number;
  onPaid?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      businessId,
      customerId,
      invoiceId: invoiceId || null,
      amount: Number(form.get("amount")),
      method: String(form.get("method")),
      reference: String(form.get("reference") || ""),
      notes: String(form.get("notes") || ""),
    };
    try {
      const res = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not record payment");
        return;
      }
      if (onPaid) onPaid();
      router.refresh();
      (e.target as HTMLFormElement).reset();
    } catch {
      setError("Could not record payment. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-[16px] border border-plum/10 bg-white p-5" aria-busy={loading}>
      <h3 className="font-heading text-sm font-bold text-plum">Record payment</h3>
      {outstanding !== undefined && <p className="text-xs text-plum/60">Outstanding: ₦{outstanding.toLocaleString("en-NG")}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5"><label htmlFor="payment-amount" className="text-xs font-medium text-plum">Amount (₦) *</label><input id="payment-amount" name="amount" type="number" min="0.01" max={outstanding !== undefined ? outstanding : undefined} step="0.01" required placeholder="50000" className="flex h-11 rounded-[12px] border border-plum/10 bg-white px-3 text-sm font-semibold text-plum" /></div>
        <div className="flex flex-col gap-1.5"><label htmlFor="payment-method" className="text-xs font-medium text-plum">Method *</label><select id="payment-method" name="method" required className="flex h-11 rounded-[12px] border border-plum/10 bg-white px-3 text-sm text-plum"><option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank Transfer</option><option value="POS">POS</option></select></div>
      </div>
      <div className="flex flex-col gap-1.5"><label htmlFor="payment-reference" className="text-xs font-medium text-plum">Reference (optional)</label><input id="payment-reference" name="reference" placeholder="Transfer ref, POS terminal..." className="flex h-11 rounded-[12px] border border-plum/10 bg-white px-3 text-sm text-plum" /></div>
      <div className="flex flex-col gap-1.5"><label htmlFor="payment-notes" className="text-xs font-medium text-plum">Notes (optional)</label><input id="payment-notes" name="notes" placeholder="Confirmed via bank alert" className="flex h-11 rounded-[12px] border border-plum/10 bg-white px-3 text-sm text-plum" /></div>
      {error && <p className="text-sm text-terracotta" role="alert" aria-live="polite">{error}</p>}
      <button type="submit" disabled={loading} className="inline-flex h-11 items-center justify-center rounded-[12px] bg-plum px-6 text-sm font-semibold text-white hover:bg-plum/90 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Recording…" : "Record payment"}</button>
      <p className="text-xs text-plum/50">Manual — marked as verified and a receipt is generated automatically.</p>
    </form>
  );
}
