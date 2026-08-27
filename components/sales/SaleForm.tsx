"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SaleForm({
  businessId,
  customers,
  preselectedCustomerId,
}: {
  businessId: string;
  customers: { id: string; name: string }[];
  preselectedCustomerId?: string;
}) {
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
      customerId: String(form.get("customerId") || "") || null,
      description: String(form.get("description")),
      quantity: Number(form.get("quantity")),
      unitPrice: Number(form.get("unitPrice")),
      discount: Number(form.get("discount") || 0),
      paymentMethod: String(form.get("paymentMethod") || "") || undefined,
      notes: String(form.get("notes") || ""),
      saleDate: String(form.get("saleDate") || "") || undefined,
    };
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not record sale");
      setLoading(false);
      return;
    }
    router.push("/sales");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-plum">Customer (optional)</label>
        <select
          name="customerId"
          defaultValue={preselectedCustomerId || ""}
          className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-sm text-plum focus:border-terracotta focus:outline-none"
        >
          <option value="">Walk-in / no customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-plum">What was sold? *</label>
        <input name="description" required placeholder="Website design, haircut, phone repair" className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-[16px] text-plum placeholder:text-plum/40 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-plum">Quantity *</label>
          <input name="quantity" type="number" step="0.01" defaultValue={1} required className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-plum focus:border-terracotta focus:outline-none" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-plum">Unit price (₦) *</label>
          <input name="unitPrice" type="number" step="0.01" required placeholder="15000" className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-plum focus:border-terracotta focus:outline-none" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-plum">Discount (₦)</label>
          <input name="discount" type="number" step="0.01" defaultValue={0} className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-plum focus:border-terracotta focus:outline-none" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-plum">Payment method</label>
          <select name="paymentMethod" className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-sm text-plum focus:border-terracotta focus:outline-none">
            <option value="">Unpaid / later</option>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="POS">POS</option>
            <option value="PAYSTACK">Paystack</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-plum">Date</label>
          <input name="saleDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-sm text-plum focus:border-terracotta focus:outline-none" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-plum">Notes (optional)</label>
        <textarea name="notes" rows={2} placeholder="Paid via transfer, reference..." className="flex w-full rounded-[12px] border border-plum/12 bg-white px-4 py-3 text-sm text-plum focus:border-terracotta focus:outline-none" />
      </div>

      {error && <p className="text-sm text-terracotta">{error}</p>}

      <button type="submit" disabled={loading} className="mt-2 inline-flex h-12 items-center justify-center rounded-[12px] bg-plum px-6 text-sm font-semibold text-white hover:bg-plum/90 disabled:opacity-60">
        {loading ? "Saving…" : "Record sale"}
      </button>
    </form>
  );
}
