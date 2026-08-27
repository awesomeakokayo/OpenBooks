"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateBusinessForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name")),
      phone: String(form.get("phone")),
      email: String(form.get("email") || ""),
      address: String(form.get("address") || ""),
      description: String(form.get("description") || ""),
    };
    const res = await fetch("/api/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not create business");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-plum">Business name *</label>
        <input
          name="name"
          required
          placeholder="Ade Phone Repairs"
          className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-[16px] text-plum placeholder:text-plum/40 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-plum">Business phone *</label>
        <input
          name="phone"
          required
          placeholder="080..."
          className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-[16px] text-plum placeholder:text-plum/40 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
        />
        <p className="text-xs text-plum/50">Used on your invoices and receipts.</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-plum">Email (optional)</label>
        <input
          name="email"
          type="email"
          placeholder="ade@example.com"
          className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-[16px] text-plum placeholder:text-plum/40 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-plum">Address (optional)</label>
        <input
          name="address"
          placeholder="Lagos, Nigeria"
          className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-[16px] text-plum placeholder:text-plum/40 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-plum">Description (optional)</label>
        <textarea
          name="description"
          rows={3}
          placeholder="Phone repairs, accessories..."
          className="flex w-full rounded-[12px] border border-plum/12 bg-white px-4 py-3 text-[16px] text-plum placeholder:text-plum/40 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
        />
      </div>
      {error && <p className="text-sm text-terracotta">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 inline-flex h-12 items-center justify-center rounded-[12px] bg-plum px-6 text-sm font-semibold text-white hover:bg-plum/90 disabled:opacity-60"
      >
        {loading ? "Creating…" : "Continue to dashboard"}
      </button>
    </form>
  );
}
