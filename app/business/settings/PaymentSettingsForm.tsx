"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Setting = {
  bankTransferEnabled: boolean;
  cashEnabled: boolean;
  posEnabled: boolean;
  paystackEnabled: boolean;
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
    paystackEnabled: initial?.paystackEnabled ?? false,
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
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMsg(data.error || "Could not save");
      return;
    }
    setMsg("Saved");
    router.refresh();
  }

  const toggle = (k: keyof typeof form) =>
    setForm((f) => ({ ...f, [k]: !f[k] as unknown as boolean }));

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex items-center justify-between rounded-[12px] border border-plum/10 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-plum">Bank Transfer</p>
          <p className="text-xs text-plum/50">Customer transfers to your account</p>
        </div>
        <input
          type="checkbox"
          checked={form.bankTransferEnabled}
          onChange={() => toggle("bankTransferEnabled")}
          className="h-5 w-5 accent-plum"
        />
      </label>

      {form.bankTransferEnabled && (
        <div className="grid gap-3 rounded-[12px] bg-pale-sage/40 p-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-plum">Bank name</label>
            <input
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              placeholder="GTBank"
              className="flex h-11 rounded-[12px] border border-plum/10 bg-white px-3 text-sm text-plum"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-plum">Account name</label>
            <input
              value={form.accountName}
              onChange={(e) => setForm({ ...form, accountName: e.target.value })}
              placeholder="Ade Phone Repairs"
              className="flex h-11 rounded-[12px] border border-plum/10 bg-white px-3 text-sm text-plum"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-plum">Account number</label>
            <input
              value={form.accountNumber}
              onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              placeholder="0123456789"
              className="flex h-11 rounded-[12px] border border-plum/10 bg-white px-3 text-sm font-semibold text-plum"
            />
          </div>
        </div>
      )}

      <label className="flex items-center justify-between rounded-[12px] border border-plum/10 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-plum">Cash</p>
          <p className="text-xs text-plum/50">Record cash received</p>
        </div>
        <input
          type="checkbox"
          checked={form.cashEnabled}
          onChange={() => toggle("cashEnabled")}
          className="h-5 w-5 accent-plum"
        />
      </label>

      <label className="flex items-center justify-between rounded-[12px] border border-plum/10 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-plum">POS</p>
          <p className="text-xs text-plum/50">Record POS payments</p>
        </div>
        <input
          type="checkbox"
          checked={form.posEnabled}
          onChange={() => toggle("posEnabled")}
          className="h-5 w-5 accent-plum"
        />
      </label>

      <label className="flex items-center justify-between rounded-[12px] border border-plum/10 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-plum">Paystack</p>
          <p className="text-xs text-plum/50">Let customers pay online</p>
        </div>
        <input
          type="checkbox"
          checked={form.paystackEnabled}
          onChange={() => toggle("paystackEnabled")}
          className="h-5 w-5 accent-plum"
        />
      </label>

      {form.paystackEnabled && (
        <p className="rounded-[12px] bg-pale-sage px-4 py-3 text-xs text-plum/70">
          Paystack checkout will be configured in Phase 6. For now this enables “Pay Online” on invoices.
        </p>
      )}

      {msg && <p className={`text-sm ${msg === "Saved" ? "text-sage" : "text-terracotta"}`}>{msg}</p>}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex h-12 items-center justify-center rounded-[12px] bg-plum px-6 text-sm font-semibold text-white hover:bg-plum/90 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
