"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CustomerForm({ businessId }: { businessId: string }) {
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
      name: String(form.get("name")),
      phone: String(form.get("phone")),
      email: String(form.get("email") || ""),
      notes: String(form.get("notes") || ""),
    };
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not create customer");
      setLoading(false);
      return;
    }
    const cust = await res.json();
    router.push(`/customers/${cust.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-plum">Customer name *</label>
        <input name="name" required placeholder="John Ade" className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-[16px] text-plum placeholder:text-plum/40 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-plum">Phone *</label>
        <input name="phone" required placeholder="080..." className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-[16px] text-plum placeholder:text-plum/40 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-plum">Email (optional)</label>
        <input name="email" type="email" placeholder="john@example.com" className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-[16px] text-plum placeholder:text-plum/40 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-plum">Notes (optional)</label>
        <textarea name="notes" rows={2} placeholder="Regular customer, pays on credit" className="flex w-full rounded-[12px] border border-plum/12 bg-white px-4 py-3 text-[16px] text-plum placeholder:text-plum/40 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20" />
      </div>
      {error && <p className="text-sm text-terracotta">{error}</p>}
      <button type="submit" disabled={loading} className="mt-2 inline-flex h-12 items-center justify-center rounded-[12px] bg-plum px-6 text-sm font-semibold text-white hover:bg-plum/90 disabled:opacity-60">
        {loading ? "Saving…" : "Save customer"}
      </button>
    </form>
  );
}
