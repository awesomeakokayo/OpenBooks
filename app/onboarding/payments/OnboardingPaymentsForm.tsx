"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OnboardingPaymentsForm({
  businessId,
  initial,
}: {
  businessId: string;
  initial: {
    bankTransferEnabled: boolean;
    cashEnabled: boolean;
    posEnabled: boolean;
    bankName: string | null;
    accountName: string | null;
    accountNumber: string | null;
  } | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    bankTransferEnabled: initial?.bankTransferEnabled ?? true,
    cashEnabled: initial?.cashEnabled ?? true,
    posEnabled: initial?.posEnabled ?? false,
    bankName: initial?.bankName ?? "",
    accountName: initial?.accountName ?? "",
    accountNumber: initial?.accountNumber ?? "",
  });

  const enabledCount = [form.bankTransferEnabled, form.cashEnabled, form.posEnabled].filter(Boolean).length;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (enabledCount === 0) {
      setError("Choose at least one payment method.");
      return;
    }

    if (form.bankTransferEnabled) {
      if (!form.bankName.trim() || !form.accountName.trim() || !/^\d{10}$/.test(form.accountNumber.trim())) {
        setError("Enter your bank name, account name and 10-digit account number.");
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch("/api/business/payment-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          bankTransferEnabled: form.bankTransferEnabled,
          cashEnabled: form.cashEnabled,
          posEnabled: form.posEnabled,
          paystackEnabled: false,
          bankName: form.bankTransferEnabled ? form.bankName.trim() : null,
          accountName: form.bankTransferEnabled ? form.accountName.trim() : null,
          accountNumber: form.bankTransferEnabled ? form.accountNumber.trim() : null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not save payment settings");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not save your payment settings. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PaymentOption
        title="Bank transfer"
        description="Customers transfer directly to your business bank account."
        checked={form.bankTransferEnabled}
        onChange={(checked) => setForm((current) => ({ ...current, bankTransferEnabled: checked }))}
      />

      {form.bankTransferEnabled && (
        <div className="grid gap-4 rounded-2xl bg-[#D0E3C4]/35 p-5">
          <p className="text-xs leading-5 text-[#503047]/65">These details will appear on invoices when you accept bank transfer.</p>
          <label className="grid gap-1.5">
            <span className="text-sm font-semibold text-[#503047]">Bank name</span>
            <input
              value={form.bankName}
              onChange={(e) => setForm((current) => ({ ...current, bankName: e.target.value }))}
              placeholder="GTBank"
              className="h-11 rounded-xl border border-[#E5E3DF] bg-white px-3 text-sm text-[#503047] outline-none focus:border-[#C05746]"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-semibold text-[#503047]">Account name</span>
            <input
              value={form.accountName}
              onChange={(e) => setForm((current) => ({ ...current, accountName: e.target.value }))}
              placeholder="Ade Phone Repairs"
              className="h-11 rounded-xl border border-[#E5E3DF] bg-white px-3 text-sm text-[#503047] outline-none focus:border-[#C05746]"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-semibold text-[#503047]">Account number</span>
            <input
              value={form.accountNumber}
              onChange={(e) => setForm((current) => ({ ...current, accountNumber: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
              inputMode="numeric"
              maxLength={10}
              placeholder="0123456789"
              className="h-11 rounded-xl border border-[#E5E3DF] bg-white px-3 font-mono text-sm font-semibold tracking-[0.04em] text-[#503047] outline-none focus:border-[#C05746]"
            />
            <span className="text-xs text-[#918A91]">Enter the 10-digit Nigerian bank account number.</span>
          </label>
        </div>
      )}

      <PaymentOption
        title="Cash"
        description="Record cash payments when you receive them in person."
        checked={form.cashEnabled}
        onChange={(checked) => setForm((current) => ({ ...current, cashEnabled: checked }))}
      />

      <PaymentOption
        title="POS"
        description="Record payments received through your POS terminal."
        checked={form.posEnabled}
        onChange={(checked) => setForm((current) => ({ ...current, posEnabled: checked }))}
      />

      <div className="rounded-2xl border border-[#E5E3DF] bg-[#F8F8F6] px-4 py-3 text-xs leading-5 text-[#6F6670]">
        OpenBooks never holds these funds. Bank transfers go directly to the account you provide, while cash and POS payments are recorded manually.
      </div>

      {error && <div role="alert" className="rounded-2xl border border-[#C05746]/15 bg-[#C05746]/5 px-4 py-3 text-sm leading-5 text-[#C05746]">{error}</div>}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#503047] px-6 text-sm font-semibold text-white hover:bg-[#3e2538] disabled:opacity-60"
      >
        {saving ? "Saving your setup…" : "Finish setup"}
      </button>
    </form>
  );
}

function PaymentOption({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border px-4 py-4 transition-colors ${checked ? "border-[#503047]/20 bg-white" : "border-[#E5E3DF] bg-white/60"}`}>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-[#503047]">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-[#918A91]">{description}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 shrink-0 accent-[#503047]" />
    </label>
  );
}
