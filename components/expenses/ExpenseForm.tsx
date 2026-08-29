"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["TRANSPORT", "MATERIALS", "ELECTRICITY", "RENT", "DATA", "SUPPLIES", "OTHER"] as const;

export function ExpenseForm({ businessId }: { businessId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      businessId,
      category: String(form.get("category")),
      amount: Number(form.get("amount")),
      description: String(form.get("description") || ""),
      paymentMethod: String(form.get("paymentMethod") || ""),
      expenseDate: String(form.get("expenseDate") || ""),
    };
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not record expense");
      setLoading(false);
      return;
    }
    router.push("/expenses");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-plum">Category *</label>
          <select name="category" required className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-sm text-plum">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-plum">Amount (₦) *</label>
          <input name="amount" type="number" min="0.01" step="0.01" required placeholder="5000" className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-plum font-semibold" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-plum">Description (optional)</label>
        <input name="description" placeholder="Fuel, data bundle..." className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-sm text-plum" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-plum">Payment method</label>
          <select name="paymentMethod" className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-sm text-plum">
            <option value="">—</option>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="POS">POS</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-plum">Date</label>
          <input name="expenseDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-sm text-plum" />
        </div>
      </div>
      {error && <p className="text-sm text-terracotta" role="alert">{error}</p>}
      <button type="submit" disabled={loading} className="mt-2 inline-flex h-12 items-center justify-center rounded-[12px] bg-plum px-6 text-sm font-semibold !text-white hover:bg-plum-deep disabled:opacity-60">
        {loading ? "Saving…" : "Record expense"}
      </button>
    </form>
  );
}
