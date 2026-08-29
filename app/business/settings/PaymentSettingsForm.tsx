"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Setting = {
  bankTransferEnabled: boolean;
  cashEnabled: boolean;
  posEnabled: boolean;
  paystackEnabled?: boolean | null;
  bankName?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
} | null;

export function PaymentSettingsForm({
  businessId,
  initial,
}: {
  businessId: string;
  initial: Setting;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    bankTransferEnabled: initial?.bankTransferEnabled ?? true,
    cashEnabled: initial?.cashEnabled ?? true,
    posEnabled: initial?.posEnabled ?? false,
    bankName: initial?.bankName ?? "",
    accountName: initial?.accountName ?? "",
    accountNumber: initial?.accountNumber ?? "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/business/payment-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, ...form }),
    });
    setSaving(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.error || "Could not save");
      return;
    }
    setMsg("Saved");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex items-center justify-between rounded-[12px] border border-plum/10 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-plum">Bank Transfer</p>
          <p className="text-xs text-plum/50">Customer transfers directly to your bank account.</p>
        </div>
        <input type="checkbox" checked={form.bankTransferEnabled} onChange={() => setForm((f) => ({ ...f, bankTransferEnabled: !f.bankTransferEnabled }))} className="h-5 w-5 accent-plum" />
      </label>

      {form.bankTransferEnabled && (
        <div className="grid gap-3 rounded-[12px] bg-pale-sage/40 p-4">
          <p className="text-xs leading-5 text-plum/60">These details will appear on invoices when Bank Transfer is enabled.</p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-plum">Bank name *</label>
            <input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} required={form.bankTransferEnabled} placeholder="GTBank" className="flex h-11 rounded-[12px] border border-plum/10 bg-white px-3 text-sm text-plum" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-plum">Account name *</label>
            <input value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} required={form.bankTransferEnabled} placeholder="Ade Phone Repairs" className="flex h-11 rounded-[12px] border border-plum/10 bg-white px-3 text-sm text-plum" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-plum">Account number *</label>
            <input value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })} required={form.bankTransferEnabled} inputMode="numeric" maxLength={10} placeholder="0123456789" className="flex h-11 rounded-[12px] border border-plum/10 bg-white px-3 text-sm font-semibold text-plum" />
          </div>
        </div>
      )}

      <label className="flex items-center justify-between rounded-[12px] border border-plum/10 px-4 py-3">
        <div><p className="text-sm font-semibold text-plum">Cash</p><p className="text-xs text-plum/50">Record cash received.</p></div>
        <input type="checkbox" checked={form.cashEnabled} onChange={() => setForm((f) => ({ ...f, cashEnabled: !f.cashEnabled }))} className="h-5 w-5 accent-plum" />
      </label>

      <label className="flex items-center justify-between rounded-[12px] border border-plum/10 px-4 py-3">
        <div><p className="text-sm font-semibold text-plum">POS</p><p className="text-xs text-plum/50">Record payments received through a POS terminal.</p></div>
        <input type="checkbox" checked={form.posEnabled} onChange={() => setForm((f) => ({ ...f, posEnabled: !f.posEnabled }))} className="h-5 w-5 accent-plum" />
      </label>

      {msg && <p className={`text-sm ${msg === "Saved" ? "text-sage" : "text-terracotta"}`} aria-live="polite">{msg}</p>}
      <button type="submit" disabled={saving} className="inline-flex h-12 items-center justify-center rounded-[12px] bg-plum px-6 text-sm font-semibold !text-white hover:bg-plum/90 disabled:opacity-60">
        {saving ? "Saving…" : "Save payment settings"}
      </button>
    </form>
  );
}
