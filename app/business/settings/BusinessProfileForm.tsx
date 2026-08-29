"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BusinessProfileForm({
  businessId,
  initial,
}: {
  businessId: string;
  initial: {
    name: string;
    phone: string;
    email?: string | null;
    address?: string | null;
    description?: string | null;
  };
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial.name,
    phone: initial.phone,
    email: initial.email ?? "",
    address: initial.address ?? "",
    description: initial.description ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/business", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, ...form }),
    });

    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setMessage(data.error || "Could not save business details");
      return;
    }

    setMessage("Business details saved.");
    router.refresh();
  }

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <form onSubmit={onSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-plum/70">Business name *</label>
        <input value={form.name} onChange={(e) => update("name", e.target.value)} required maxLength={100} className="h-11 rounded-xl border border-plum/10 bg-white px-3 text-sm text-plum outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/15" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-plum/70">Business phone *</label>
        <input value={form.phone} onChange={(e) => update("phone", e.target.value)} required maxLength={20} className="h-11 rounded-xl border border-plum/10 bg-white px-3 text-sm text-plum outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/15" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-plum/70">Business email</label>
        <input value={form.email} onChange={(e) => update("email", e.target.value)} type="email" maxLength={160} className="h-11 rounded-xl border border-plum/10 bg-white px-3 text-sm text-plum outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/15" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-plum/70">Address</label>
        <input value={form.address} onChange={(e) => update("address", e.target.value)} maxLength={200} className="h-11 rounded-xl border border-plum/10 bg-white px-3 text-sm text-plum outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/15" />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label className="text-xs font-semibold text-plum/70">Business description</label>
        <textarea value={form.description} onChange={(e) => update("description", e.target.value)} maxLength={500} rows={3} className="rounded-xl border border-plum/10 bg-white px-3 py-3 text-sm text-plum outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/15" />
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={saving} className="inline-flex h-11 items-center justify-center rounded-xl bg-plum px-5 text-sm font-semibold !text-white hover:bg-plum-deep disabled:opacity-60">{saving ? "Saving…" : "Save business details"}</button>
        {message && <p className={`text-sm ${message.includes("saved") ? "text-sage" : "text-terracotta"}`} aria-live="polite">{message}</p>}
      </div>
    </form>
  );
}
