"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, X } from "lucide-react";

type CustomerOpt = { id: string; name: string };
type NewCustomerForm = { name: string; phone: string; email: string };
type InvoiceItem = { description: string; quantity: string; unitPrice: string };

const emptyCustomer: NewCustomerForm = { name: "", phone: "", email: "" };
const emptyItem: InvoiceItem = { description: "", quantity: "1", unitPrice: "" };
function parseAmount(value: string): number { const amount = Number(value); return Number.isFinite(amount) ? amount : 0; }

export function InvoiceForm({ businessId, customers }: { businessId: string; customers: CustomerOpt[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([{ ...emptyItem }]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(["BANK_TRANSFER"]);
  const [customerOptions, setCustomerOptions] = useState<CustomerOpt[]>(customers);
  const [customerId, setCustomerId] = useState("");
  const [customerFormOpen, setCustomerFormOpen] = useState(customers.length === 0);
  const [customerSaving, setCustomerSaving] = useState(false);
  const [customerError, setCustomerError] = useState("");
  const [newCustomer, setNewCustomer] = useState<NewCustomerForm>(emptyCustomer);

  function updateItem(idx: number, field: keyof InvoiceItem, value: string) { setItems((current) => current.map((item, itemIndex) => itemIndex === idx ? { ...item, [field]: value } : item)); }
  function toggleMethod(m: string) { setPaymentMethods((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]); }
  function updateNewCustomer(field: keyof NewCustomerForm, value: string) { setNewCustomer((current) => ({ ...current, [field]: value })); }

  async function createCustomerInline() {
    if (customerSaving) return;
    setCustomerError("");
    if (newCustomer.name.trim().length < 2) { setCustomerError("Enter the customer's name."); return; }
    if (newCustomer.phone.trim().length < 8) { setCustomerError("Enter a valid phone number."); return; }
    setCustomerSaving(true);
    try {
      const res = await fetch("/api/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ businessId, name: newCustomer.name.trim(), phone: newCustomer.phone.trim(), email: newCustomer.email.trim() }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setCustomerError(typeof data.error === "string" ? data.error : "Could not create customer"); return; }
      const created: CustomerOpt = { id: data.id, name: data.name };
      setCustomerOptions((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
      setCustomerId(created.id); setNewCustomer(emptyCustomer); setCustomerFormOpen(false);
    } catch { setCustomerError("Could not create customer. Check your connection and try again."); }
    finally { setCustomerSaving(false); }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError("");
    if (!customerId) { setError("Select a customer or create one here."); return; }
    if (!paymentMethods.length) { setError("Select at least one payment method"); return; }
    const parsedItems = items.map((item) => ({ description: item.description, quantity: parseAmount(item.quantity), unitPrice: parseAmount(item.unitPrice) }));
    if (parsedItems.some((item) => !item.description.trim() || item.quantity <= 0 || item.unitPrice <= 0)) { setError("Each item needs a description, quantity greater than 0, and a unit price greater than 0."); return; }
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const discountValue = String(form.get("discount") ?? "").trim();
    const discount = discountValue === "" ? 0 : parseAmount(discountValue);
    try {
      const res = await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ businessId, customerId, items: parsedItems, discount, dueDate: String(form.get("dueDate") || "") || null, notes: String(form.get("notes") || ""), paymentMethods }) });
      if (!res.ok) { const data = await res.json().catch(() => ({})); setError(data.error || "Could not create invoice"); return; }
      const inv = await res.json(); router.push(`/invoices/${inv.id}`);
    } catch { setError("Could not create invoice. Check your connection and try again."); }
    finally { setLoading(false); }
  }

  const subtotal = items.reduce((sum, item) => { const quantity = parseAmount(item.quantity); const unitPrice = parseAmount(item.unitPrice); return quantity > 0 && unitPrice >= 0 ? sum + Math.round((quantity * unitPrice + Number.EPSILON) * 100) / 100 : sum; }, 0);

  return (
    <form onSubmit={onSubmit} className="flex min-w-0 flex-col gap-6" aria-busy={loading}>
      <div className="flex flex-col gap-2"><div className="flex items-center justify-between gap-4"><label htmlFor="invoice-customer" className="text-sm font-medium text-plum">Customer *</label><button type="button" onClick={() => { setCustomerFormOpen((open) => !open); setCustomerError(""); }} className="inline-flex min-h-10 items-center gap-1.5 px-1 text-xs font-bold text-terracotta hover:text-plum">{customerFormOpen ? <X size={14} /> : <Plus size={14} />}{customerFormOpen ? "Close" : "New customer"}</button></div>
        <select id="invoice-customer" name="customerId" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required className="flex h-[48px] w-full min-w-0 rounded-[12px] border border-plum/12 bg-white px-4 text-sm text-plum"><option value="">Select customer</option>{customerOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        {customerFormOpen && <div className="rounded-2xl border border-plum/10 bg-[#F8F8F6] p-4 sm:p-5"><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pale-sage text-plum"><Plus size={17} /></span><div><p className="text-sm font-bold text-plum">Add customer without leaving the invoice</p><p className="mt-1 text-xs leading-5 text-plum/50">Save the customer and we'll select them automatically.</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><input required aria-label="Customer name" minLength={2} value={newCustomer.name} onChange={(e) => updateNewCustomer("name", e.target.value)} placeholder="Customer name" className="flex h-[44px] min-w-0 w-full rounded-xl border border-plum/12 bg-white px-3.5 text-sm text-plum" /><input required aria-label="Customer phone number" minLength={8} value={newCustomer.phone} onChange={(e) => updateNewCustomer("phone", e.target.value)} placeholder="Phone number" inputMode="tel" className="flex h-[44px] min-w-0 w-full rounded-xl border border-plum/12 bg-white px-3.5 text-sm text-plum" /><input aria-label="Customer email" type="email" value={newCustomer.email} onChange={(e) => updateNewCustomer("email", e.target.value)} placeholder="Email (optional)" className="flex h-[44px] min-w-0 w-full rounded-xl border border-plum/12 bg-white px-3.5 text-sm text-plum sm:col-span-2" />{customerError && <p role="alert" className="text-xs leading-5 text-terracotta sm:col-span-2">{customerError}</p>}<button type="button" onClick={createCustomerInline} disabled={customerSaving} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-plum px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2">{customerSaving ? "Adding customer…" : "Add customer and select"} <Check size={14} /></button></div></div>}
      </div>
      <div className="flex min-w-0 flex-col gap-3"><div className="flex items-center justify-between gap-4"><label className="text-sm font-medium text-plum">Items *</label><button type="button" onClick={() => setItems((current) => [...current, { ...emptyItem }])} className="min-h-10 shrink-0 px-1 text-xs font-semibold text-terracotta hover:text-plum">+ Add item</button></div>{items.map((it, idx) => <div key={idx} className="grid min-w-0 gap-2 rounded-[12px] border border-plum/10 bg-white p-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"><input aria-label={`Item ${idx + 1} description`} placeholder="Description" value={it.description} onChange={(e) => updateItem(idx, "description", e.target.value)} className="min-w-0 w-full rounded-[12px] border border-plum/10 bg-white px-3 py-2.5 text-sm text-plum" /><input aria-label={`Item ${idx + 1} quantity`} type="text" inputMode="decimal" placeholder="Qty" value={it.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} className="min-w-0 w-full rounded-[12px] border border-plum/10 bg-white px-3 py-2.5 text-sm text-plum" /><input aria-label={`Item ${idx + 1} unit price`} type="text" inputMode="decimal" placeholder="Unit price" value={it.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", e.target.value)} className="min-w-0 w-full rounded-[12px] border border-plum/10 bg-white px-3 py-2.5 text-sm text-plum font-semibold" /><button type="button" onClick={() => setItems((current) => current.filter((_, i) => i !== idx))} disabled={items.length === 1} className="min-h-10 shrink-0 px-1 text-xs text-plum/40 disabled:opacity-30">Remove</button></div>)}<p className="text-sm font-semibold text-plum">Subtotal: ₦{subtotal.toLocaleString("en-NG")}</p></div>
      <div className="grid gap-3 sm:grid-cols-2"><div className="flex min-w-0 flex-col gap-1.5"><label htmlFor="invoice-discount" className="text-sm font-medium text-plum">Discount (₦)</label><input id="invoice-discount" name="discount" type="text" inputMode="decimal" defaultValue="0" className="flex h-[48px] min-w-0 w-full rounded-[12px] border border-plum/12 bg-white px-4 text-plum" /></div><div className="flex min-w-0 flex-col gap-1.5"><label htmlFor="invoice-due-date" className="text-sm font-medium text-plum">Due date</label><input id="invoice-due-date" name="dueDate" type="date" className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-sm text-plum" /></div></div>
      <div className="flex flex-col gap-1.5"><label htmlFor="invoice-notes" className="text-sm font-medium text-plum">Notes (optional)</label><textarea id="invoice-notes" name="notes" rows={2} placeholder="Payment terms, delivery..." className="flex w-full rounded-[12px] border border-plum/12 bg-white px-4 py-3 text-sm text-plum" /></div>
      <div className="flex flex-col gap-2"><label className="text-sm font-medium text-plum">Payment methods *</label><p className="text-xs text-plum/50">Only selected methods will appear to the customer. Defaults from Business Settings.</p>{["BANK_TRANSFER", "CASH", "POS"].map((m) => <label key={m} className="flex min-h-11 items-center justify-between rounded-[12px] border border-plum/10 px-4 py-2.5"><span className="text-sm font-medium text-plum">{m.replaceAll("_", " ")}</span><input type="checkbox" checked={paymentMethods.includes(m)} onChange={() => toggleMethod(m)} className="h-5 w-5 accent-plum" /></label>)}</div>
      {error && <p role="alert" aria-live="polite" className="text-sm text-terracotta">{error}</p>}
      <button type="submit" disabled={loading} className="inline-flex h-12 items-center justify-center rounded-[12px] bg-plum px-6 text-sm font-semibold text-white hover:bg-plum/90 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Creating…" : "Create invoice"}</button>
    </form>
  );
}
