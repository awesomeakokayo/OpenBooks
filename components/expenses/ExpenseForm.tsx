"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["TRANSPORT", "MATERIALS", "ELECTRICITY", "RENT", "DATA", "SUPPLIES", "OTHER"] as const;
const PAYMENT_METHODS = ["CASH", "BANK_TRANSFER", "POS"] as const;

export function ExpenseForm({ businessId }: { businessId: string }) {
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
      category: String(form.get("category")),
      amount: Number(form.get("amount")),
      description: String(form.get("description") || ""),
      paymentMethod: String(form.get("paymentMethod") || "") || null,
      expenseDate: String(form.get("expenseDate") || ""),
    };
    try {
      const res = await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not record expense");
        return;
      }
      router.push("/expenses");
      router.refresh();
    } catch {
      setError("Could not record expense. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" aria-busy={loading}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5"><label htmlFor="expense-category" className="text-sm font-medium text-plum">Category *</label><select id="expense-category" name="category" required className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-sm text-plum">{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
        <div className="flex flex-col gap-1.5"><label htmlFor="expense-amount" className="text-sm font-medium text-plum">Amount (₦) *</label><input id="expense-amount" name="amount" type="number" min="0.01" step="0.01" required placeholder="5000" className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-plum font-semibold" /></div>
      </div>
      <div className="flex flex-col gap-1.5"><label htmlFor="expense-description" className="text-sm font-medium text-plum">Description (optional)</label><input id="expense-description" name="description" placeholder="Fuel, data bundle..." className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-sm text-plum" /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5"><label htmlFor="expense-payment-method" className="text-sm font-medium text-plum">Payment method</label><select id="expense-payment-method" name="paymentMethod" className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-sm text-plum"><option value="">Not specified</option>{PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m.replaceAll("_", " ")}</option>)}</select></div>
        <div className="flex flex-col gap-1.5"><label htmlFor="expense-date" className="text-sm font-medium text-plum">Date</label><input id="expense-date" name="expenseDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-sm text-plum" /></div>
      </div>
      {error && <p className="text-sm text-terracotta" role="alert">{error}</p>}
      <button type="submit" disabled={loading} className="mt-2 inline-flex h-12 items-center justify-center rounded-[12px] bg-plum px-6 text-sm font-semibold !text-white hover:bg-plum-deep disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Saving…" : "Record expense"}</button>
    </form>
  );
}
