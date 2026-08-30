"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SaleForm({ businessId, customers, preselectedCustomerId }: { businessId: string; customers: { id: string; name: string }[]; preselectedCustomerId?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = { businessId, customerId: String(form.get("customerId") || "") || null, description: String(form.get("description")), quantity: Number(form.get("quantity")), unitPrice: Number(form.get("unitPrice")), discount: Number(form.get("discount") || 0), paymentMethod: String(form.get("paymentMethod") || "") || undefined, notes: String(form.get("notes") || ""), saleDate: String(form.get("saleDate") || "") || undefined };
    try {
      const res = await fetch("/api/sales", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const data = await res.json().catch(() => ({})); setError(data.error || "Could not record sale"); return; }
      router.push("/sales");
      router.refresh();
    } catch { setError("Could not record sale. Check your connection and try again."); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" aria-busy={loading}>
      <div className="flex flex-col gap-1.5"><label htmlFor="sale-customer" className="text-sm font-medium text-plum">Customer (optional)</label><select id="sale-customer" name="customerId" defaultValue={preselectedCustomerId || ""} className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-sm text-plum focus:border-terracotta focus:outline-none"><option value="">Walk-in / no customer</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div className="flex flex-col gap-1.5"><label htmlFor="sale-description" className="text-sm font-medium text-plum">What was sold? *</label><input id="sale-description" name="description" required placeholder="Website design, haircut, phone repair" className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-[16px] text-plum placeholder:text-plum/40 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20" /></div>
      <div className="grid gap-3 sm:grid-cols-3"><div className="flex flex-col gap-1.5"><label htmlFor="sale-quantity" className="text-sm font-medium text-plum">Quantity *</label><input id="sale-quantity" name="quantity" type="number" min="0.01" step="0.01" defaultValue={1} required className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-plum" /></div><div className="flex flex-col gap-1.5"><label htmlFor="sale-unit-price" className="text-sm font-medium text-plum">Unit price (₦) *</label><input id="sale-unit-price" name="unitPrice" type="number" min="0.01" step="0.01" required placeholder="15000" className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-plum" /></div><div className="flex flex-col gap-1.5"><label htmlFor="sale-discount" className="text-sm font-medium text-plum">Discount (₦)</label><input id="sale-discount" name="discount" type="number" min="0" step="0.01" defaultValue={0} className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-plum" /></div></div>
      <div className="grid gap-3 sm:grid-cols-2"><div className="flex flex-col gap-1.5"><label htmlFor="sale-payment-method" className="text-sm font-medium text-plum">Payment method</label><select id="sale-payment-method" name="paymentMethod" className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-sm text-plum"><option value="">Unpaid / later</option><option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank Transfer</option><option value="POS">POS</option></select></div><div className="flex flex-col gap-1.5"><label htmlFor="sale-date" className="text-sm font-medium text-plum">Date</label><input id="sale-date" name="saleDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-sm text-plum" /></div></div>
      <div className="flex flex-col gap-1.5"><label htmlFor="sale-notes" className="text-sm font-medium text-plum">Notes (optional)</label><textarea id="sale-notes" name="notes" rows={2} placeholder="Paid via transfer, reference..." className="flex w-full rounded-[12px] border border-plum/12 bg-white px-4 py-3 text-sm text-plum" /></div>
      {error && <p className="text-sm text-terracotta" role="alert" aria-live="polite">{error}</p>}
      <button type="submit" disabled={loading} className="mt-2 inline-flex h-12 items-center justify-center rounded-[12px] bg-plum px-6 text-sm font-semibold text-white hover:bg-plum/90 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Saving…" : "Record sale"}</button>
    </form>
  );
}
