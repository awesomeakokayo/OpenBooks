"use client";

import { useMemo, useState } from "react";
import { Calculator, Download, FileText, Printer, ReceiptText } from "lucide-react";

const money = (value: string | number) => `₦${Number(value || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function InvoiceGenerator() {
  const [business, setBusiness] = useState("My Business");
  const [customer, setCustomer] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("0");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");

  const total = Number(amount || 0);
  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-3xl border border-plum/10 bg-white p-5 shadow-[0_14px_40px_rgba(80,48,71,0.07)] sm:p-7">
        <div className="grid gap-4">
          <Field label="Business name" value={business} onChange={setBusiness} />
          <Field label="Customer name" value={customer} onChange={setCustomer} />
          <Field label="Invoice number" value={invoiceNumber} onChange={setInvoiceNumber} />
          <Field label="What are you billing for?" value={description} onChange={setDescription} />
          <Field label="Amount (NGN)" value={amount} onChange={setAmount} type="number" />
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button onClick={() => window.print()} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-plum px-4 text-sm font-bold text-white hover:bg-plum-deep"><Printer size={16} /> Print / Save PDF</button>
          <button onClick={() => { setBusiness("My Business"); setCustomer(""); setDescription(""); setAmount("0"); setInvoiceNumber("INV-001"); }} className="inline-flex h-12 items-center justify-center rounded-xl border border-plum/10 bg-white px-4 text-sm font-bold text-plum hover:bg-pale-sage">Reset</button>
        </div>
      </div>

      <div id="invoice-preview" className="rounded-3xl bg-white p-6 shadow-[0_18px_50px_rgba(80,48,71,0.1)] sm:p-9">
        <div className="flex items-start justify-between gap-4 border-b border-plum/10 pb-6">
          <div><p className="font-heading text-xl font-extrabold text-plum">{business || "My Business"}</p><p className="mt-1 text-sm text-plum/50">Invoice</p></div>
          <div className="text-right"><p className="text-xs font-bold uppercase tracking-[0.15em] text-plum/40">{invoiceNumber || "INV-001"}</p><p className="mt-1 text-xs text-plum/50">{new Date().toLocaleDateString("en-NG")}</p></div>
        </div>
        <div className="mt-7"><p className="text-xs font-bold uppercase tracking-[0.13em] text-plum/40">Bill to</p><p className="mt-2 text-base font-bold text-plum">{customer || "Customer name"}</p></div>
        <div className="mt-8 overflow-hidden rounded-2xl border border-plum/10">
          <div className="grid grid-cols-[1fr_auto] gap-4 bg-pale-sage/60 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-plum/50"><span>Description</span><span>Amount</span></div>
          <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-5 text-sm"><span className="text-plum/70">{description || "Service or product"}</span><span className="font-bold text-plum">{money(total)}</span></div>
        </div>
        <div className="mt-7 flex items-end justify-between border-t border-plum/10 pt-5"><span className="text-sm font-semibold text-plum/50">Total due</span><span className="font-heading text-3xl font-extrabold text-plum">{money(total)}</span></div>
        <p className="mt-8 rounded-2xl bg-plum/[0.03] p-4 text-xs leading-5 text-plum/50">Payment details can be added when you send the final invoice through OpenBooks.</p>
      </div>
    </div>
  );
}

export function ReceiptGenerator() {
  const [business, setBusiness] = useState("My Business");
  const [customer, setCustomer] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("0");
  const [method, setMethod] = useState("Bank transfer");
  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-3xl border border-plum/10 bg-white p-5 shadow-[0_14px_40px_rgba(80,48,71,0.07)] sm:p-7">
        <div className="grid gap-4">
          <Field label="Business name" value={business} onChange={setBusiness} />
          <Field label="Customer name" value={customer} onChange={setCustomer} />
          <Field label="What was paid for?" value={description} onChange={setDescription} />
          <Field label="Amount received (NGN)" value={amount} onChange={setAmount} type="number" />
          <label className="grid gap-2 text-sm font-semibold text-plum">Payment method<select value={method} onChange={(e) => setMethod(e.target.value)} className="h-12 rounded-xl border border-plum/10 bg-white px-3 text-sm font-medium text-plum outline-none focus:border-plum/25"><option>Bank transfer</option><option>Cash</option><option>POS</option><option>Paystack</option></select></label>
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row"><button onClick={() => window.print()} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-terracotta px-4 text-sm font-bold text-white hover:bg-terracotta-dark"><Printer size={16} /> Print / Save PDF</button><button onClick={() => { setBusiness("My Business"); setCustomer(""); setDescription(""); setAmount("0"); setMethod("Bank transfer"); }} className="inline-flex h-12 items-center justify-center rounded-xl border border-plum/10 bg-white px-4 text-sm font-bold text-plum hover:bg-pale-sage">Reset</button></div>
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-[0_18px_50px_rgba(80,48,71,0.1)] sm:p-9">
        <div className="border-b border-plum/10 pb-6 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-pale-sage text-plum"><ReceiptText size={22} /></div><p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-terracotta">Payment receipt</p><p className="mt-2 font-heading text-xl font-extrabold text-plum">{business || "My Business"}</p></div>
        <div className="mt-7 space-y-4 text-sm"><Row label="Received from" value={customer || "Customer name"} /><Row label="Payment for" value={description || "Service or product"} /><Row label="Payment method" value={method} /></div>
        <div className="mt-8 rounded-2xl bg-plum p-6 text-center text-white"><p className="text-xs font-bold uppercase tracking-[0.15em] text-white/55">Amount received</p><p className="mt-2 font-heading text-4xl font-extrabold">{money(amount)}</p></div>
        <p className="mt-7 text-center text-xs leading-5 text-plum/45">Generated with OpenBooks · Keep this receipt with your business records.</p>
      </div>
    </div>
  );
}

export function ProfitCalculator() {
  const [sales, setSales] = useState("0");
  const [costs, setCosts] = useState("0");
  const [expenses, setExpenses] = useState("0");
  const result = useMemo(() => {
    const revenue = Number(sales || 0);
    const cost = Number(costs || 0);
    const expense = Number(expenses || 0);
    const gross = revenue - cost;
    const net = gross - expense;
    return { revenue, gross, net, margin: revenue > 0 ? (net / revenue) * 100 : 0 };
  }, [sales, costs, expenses]);
  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-3xl border border-plum/10 bg-white p-5 shadow-[0_14px_40px_rgba(80,48,71,0.07)] sm:p-7"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pale-sage text-plum"><Calculator size={22} /></div><h2 className="mt-5 font-heading text-xl font-extrabold">Enter your numbers</h2><p className="mt-1 text-sm leading-6 text-plum/50">Use your sales, direct costs and operating expenses for the same period.</p><div className="mt-6 grid gap-4"><Field label="Total sales (NGN)" value={sales} onChange={setSales} type="number" /><Field label="Cost of goods / services (NGN)" value={costs} onChange={setCosts} type="number" /><Field label="Other business expenses (NGN)" value={expenses} onChange={setExpenses} type="number" /></div></div>
      <div className="grid gap-4 sm:grid-cols-2"><Metric label="Sales" value={money(result.revenue)} /><Metric label="Gross profit" value={money(result.gross)} /><Metric label="Net profit" value={money(result.net)} emphasized /><Metric label="Net margin" value={`${result.margin.toFixed(1)}%`} /><div className="sm:col-span-2 rounded-3xl bg-plum p-6 text-white"><p className="text-xs font-bold uppercase tracking-[0.15em] text-pale-sage">Formula</p><p className="mt-3 text-sm leading-6 text-white/75">Gross profit = sales − direct costs. Net profit = gross profit − other business expenses.</p><p className="mt-3 text-sm font-semibold text-white/90">These calculations are estimates for planning. Keep your actual business records in OpenBooks.</p></div></div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="grid gap-2 text-sm font-semibold text-plum">{label}<input type={type} min={type === "number" ? "0" : undefined} value={value} onChange={(e) => onChange(e.target.value)} className="h-12 rounded-xl border border-plum/10 bg-white px-3 text-sm font-medium text-plum outline-none placeholder:text-plum/30 focus:border-plum/25" /></label>;
}
function Row({ label, value }: { label: string; value: string }) { return <div className="flex items-start justify-between gap-5 border-b border-plum/10 pb-3"><span className="text-plum/45">{label}</span><span className="text-right font-semibold text-plum">{value}</span></div>; }
function Metric({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) { return <div className={`rounded-3xl p-6 ${emphasized ? "bg-terracotta text-white" : "bg-white border border-plum/10 text-plum"}`}><p className={`text-xs font-bold uppercase tracking-[0.14em] ${emphasized ? "text-white/65" : "text-plum/45"}`}>{label}</p><p className="mt-3 font-heading text-2xl font-extrabold">{value}</p></div>; }
