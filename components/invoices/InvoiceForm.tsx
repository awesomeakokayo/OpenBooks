"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, X } from "lucide-react";

type CustomerOpt = { id: string; name: string };

type NewCustomerForm = {
  name: string;
  phone: string;
  email: string;
};

const emptyCustomer: NewCustomerForm = { name: "", phone: "", email: "" };

export function InvoiceForm({
  businessId,
  customers,
}: {
  businessId: string;
  customers: CustomerOpt[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([{ description: "", quantity: 1, unitPrice: 0 }]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(["BANK_TRANSFER"]);
  const [customerOptions, setCustomerOptions] = useState<CustomerOpt[]>(customers);
  const [customerId, setCustomerId] = useState("");
  const [customerFormOpen, setCustomerFormOpen] = useState(customers.length === 0);
  const [customerSaving, setCustomerSaving] = useState(false);
  const [customerError, setCustomerError] = useState("");
  const [newCustomer, setNewCustomer] = useState<NewCustomerForm>(emptyCustomer);

  function updateItem(idx: number, field: string, value: string) {
    const copy = [...items];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (copy[idx] as any)[field] = field === "description" ? value : Number(value);
    setItems(copy);
  }

  function toggleMethod(m: string) {
    setPaymentMethods((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  function updateNewCustomer(field: keyof NewCustomerForm, value: string) {
    setNewCustomer((current) => ({ ...current, [field]: value }));
  }

  async function createCustomerInline(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCustomerError("");
    setCustomerSaving(true);

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          name: newCustomer.name.trim(),
          phone: newCustomer.phone.trim(),
          email: newCustomer.email.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCustomerError(typeof data.error === "string" ? data.error : "Could not create customer");
        return;
      }

      const created: CustomerOpt = { id: data.id, name: data.name };
      setCustomerOptions((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
      setCustomerId(created.id);
      setNewCustomer(emptyCustomer);
      setCustomerFormOpen(false);
    } catch {
      setCustomerError("Could not create customer. Check your connection and try again.");
    } finally {
      setCustomerSaving(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      businessId,
      customerId,
      items: items.map((it) => ({ description: it.description, quantity: Number(it.quantity), unitPrice: Number(it.unitPrice) })),
      discount: Number(form.get("discount") || 0),
      dueDate: String(form.get("dueDate") || "") || null,
      notes: String(form.get("notes") || ""),
      paymentMethods,
    };
    if (!payload.customerId) {
      setError("Select a customer or create one here.");
      setLoading(false);
      return;
    }
    if (payload.paymentMethods.length === 0) {
      setError("Select at least one payment method");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not create invoice");
        return;
      }
      const inv = await res.json();
      router.push(`/invoices/${inv.id}`);
      router.refresh();
    } catch {
      setError("Could not create invoice. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const subtotal = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm font-medium text-plum">Customer *</label>
          <button
            type="button"
            onClick={() => {
              setCustomerFormOpen((open) => !open);
              setCustomerError("");
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-terracotta hover:text-plum"
          >
            {customerFormOpen ? <X size={14} /> : <Plus size={14} />}
            {customerFormOpen ? "Close" : "New customer"}
          </button>
        </div>

        <select
          name="customerId"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          required
          className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-sm text-plum"
        >
          <option value="">Select customer</option>
          {customerOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {customerOptions.length === 0 && !customerFormOpen && (
          <p className="text-xs text-terracotta">No customers yet — create your first customer here.</p>
        )}

        {customerFormOpen && (
          <div className="rounded-2xl border border-plum/10 bg-[#F8F8F6] p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pale-sage text-plum"><Plus size={17} /></span>
              <div>
                <p className="text-sm font-bold text-plum">Add customer without leaving the invoice</p>
                <p className="mt-1 text-xs leading-5 text-plum/50">We'll save the customer to your business records and select them automatically.</p>
              </div>
            </div>
            <form onSubmit={createCustomerInline} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input required minLength={2} value={newCustomer.name} onChange={(e) => updateNewCustomer("name", e.target.value)} placeholder="Customer name" className="flex h-[44px] w-full rounded-xl border border-plum/12 bg-white px-3.5 text-sm text-plum placeholder:text-plum/35" />
              <input required minLength={8} value={newCustomer.phone} onChange={(e) => updateNewCustomer("phone", e.target.value)} placeholder="Phone number" inputMode="tel" className="flex h-[44px] w-full rounded-xl border border-plum/12 bg-white px-3.5 text-sm text-plum placeholder:text-plum/35" />
              <input type="email" value={newCustomer.email} onChange={(e) => updateNewCustomer("email", e.target.value)} placeholder="Email (optional)" className="flex h-[44px] w-full rounded-xl border border-plum/12 bg-white px-3.5 text-sm text-plum placeholder:text-plum/35 sm:col-span-2" />
              {customerError && <p role="alert" className="text-xs leading-5 text-terracotta sm:col-span-2">{customerError}</p>}
              <button type="submit" disabled={customerSaving} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-plum px-4 text-xs font-bold text-white hover:bg-plum-deep disabled:opacity-60 sm:col-span-2">
                {customerSaving ? "Adding customer…" : "Add customer and select"} <Check size={14} />
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-plum">Items *</label>
          <button type="button" onClick={() => setItems([...items, { description: "", quantity: 1, unitPrice: 0 }])} className="text-xs font-semibold text-terracotta hover:text-plum">
            + Add item
          </button>
        </div>
        {items.map((it, idx) => (
          <div key={idx} className="grid gap-2 rounded-[12px] border border-plum/10 bg-white p-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
            <input placeholder="Description" value={it.description} onChange={(e) => updateItem(idx, "description", e.target.value)} className="rounded-[12px] border border-plum/10 bg-white px-3 py-2.5 text-sm text-plum" />
            <input type="number" step="0.01" placeholder="Qty" value={it.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} className="rounded-[12px] border border-plum/10 bg-white px-3 py-2.5 text-sm text-plum" />
            <input type="number" step="0.01" placeholder="Unit price" value={it.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", e.target.value)} className="rounded-[12px] border border-plum/10 bg-white px-3 py-2.5 text-sm text-plum font-semibold" />
            <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} disabled={items.length === 1} className="text-xs text-plum/40 disabled:opacity-30">Remove</button>
          </div>
        ))}
        <p className="text-sm font-semibold text-plum">Subtotal: ₦{subtotal.toLocaleString("en-NG")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-plum">Discount (₦)</label>
          <input name="discount" type="number" step="0.01" defaultValue={0} className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-plum" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-plum">Due date</label>
          <input name="dueDate" type="date" className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-sm text-plum" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-plum">Notes (optional)</label>
        <textarea name="notes" rows={2} placeholder="Payment terms, delivery..." className="flex w-full rounded-[12px] border border-plum/12 bg-white px-4 py-3 text-sm text-plum" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-plum">Payment methods *</label>
        <p className="text-xs text-plum/50">Only selected methods will appear to the customer. Defaults from Business Settings.</p>
        {["BANK_TRANSFER", "CASH", "POS", "PAYSTACK"].map((m) => (
          <label key={m} className="flex items-center justify-between rounded-[12px] border border-plum/10 px-4 py-2.5">
            <span className="text-sm font-medium text-plum">{m.replace("_", " ")}</span>
            <input type="checkbox" checked={paymentMethods.includes(m)} onChange={() => toggleMethod(m)} className="h-5 w-5 accent-plum" />
          </label>
        ))}
      </div>

      {error && <p className="text-sm text-terracotta">{error}</p>}

      <button type="submit" disabled={loading} className="inline-flex h-12 items-center justify-center rounded-[12px] bg-plum px-6 text-sm font-semibold text-white hover:bg-plum/90 disabled:opacity-60">
        {loading ? "Creating…" : "Create invoice"}
      </button>
    </form>
  );
}
