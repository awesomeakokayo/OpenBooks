"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, Check, Landmark, Banknote, CreditCard } from "lucide-react";

const inputClass = "flex h-[50px] w-full rounded-2xl border border-plum/12 bg-white px-4 text-[15px] text-plum placeholder:text-plum/35 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20";

type BusinessDetails = {
  name: string;
  phone: string;
  email: string;
  address: string;
  description: string;
};

export function CreateBusinessForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [methods, setMethods] = useState({ bankTransfer: true, cash: true, pos: false });
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
    name: "",
    phone: "",
    email: "",
    address: "",
    description: "",
  });

  function updateBusinessDetail(field: keyof BusinessDetails, value: string) {
    setBusinessDetails((current) => ({ ...current, [field]: value }));
  }

  function validateStepOne() {
    const name = businessDetails.name.trim();
    const phone = businessDetails.phone.trim();
    if (name.length < 2) return "Enter your business name.";
    if (phone.length < 8) return "Enter a valid business phone number.";
    return null;
  }

  function continueToPayments(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const message = validateStepOne();
    setError(message || "");
    if (!message) setStep(2);
  }

  function toggleMethod(key: keyof typeof methods) {
    setMethods((current) => ({ ...current, [key]: !current[key] }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!methods.bankTransfer && !methods.cash && !methods.pos) {
      setError("Choose at least one payment method.");
      setLoading(false);
      return;
    }

    const payload = {
      name: businessDetails.name.trim(),
      phone: businessDetails.phone.trim(),
      email: businessDetails.email.trim(),
      address: businessDetails.address.trim(),
      description: businessDetails.description.trim(),
      paymentSettings: {
        bankTransferEnabled: methods.bankTransfer,
        cashEnabled: methods.cash,
        posEnabled: methods.pos,
        bankName: e.currentTarget.elements.namedItem("bankName") instanceof HTMLInputElement
          ? e.currentTarget.elements.namedItem("bankName")?.value.trim() || ""
          : "",
        accountName: e.currentTarget.elements.namedItem("accountName") instanceof HTMLInputElement
          ? e.currentTarget.elements.namedItem("accountName")?.value.trim() || ""
          : "",
        accountNumber: e.currentTarget.elements.namedItem("accountNumber") instanceof HTMLInputElement
          ? e.currentTarget.elements.namedItem("accountNumber")?.value.trim() || ""
          : "",
      },
    };

    try {
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not create business");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not create your business. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={step === 1 ? continueToPayments : onSubmit} className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        {[1, 2].map((item) => (
          <div key={item} className="flex flex-1 items-center gap-2">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step >= item ? "bg-terracotta text-white" : "bg-pale-sage text-plum/45"}`}>{step > item ? <Check size={14} /> : item}</span>
            <span className="hidden text-xs font-semibold text-plum/55 sm:block">{item === 1 ? "Business" : "Payments"}</span>
            {item === 1 && <span className="h-px flex-1 bg-plum/10" />}
          </div>
        ))}
      </div>

      {step === 1 ? (
        <>
          <div>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-pale-sage text-plum"><Building2 size={20} /></div>
            <h2 className="font-heading text-xl font-extrabold text-plum">Tell us about your business</h2>
            <p className="mt-1 text-sm leading-6 text-plum/55">This is the information customers will see on invoices and receipts.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-plum">Business name *</label>
            <input name="name" required placeholder="Ade Phone Repairs" className={inputClass} autoComplete="organization" value={businessDetails.name} onChange={(e) => updateBusinessDetail("name", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-plum">Business phone *</label>
            <input name="phone" required placeholder="0803 000 0000" inputMode="tel" className={inputClass} autoComplete="tel" value={businessDetails.phone} onChange={(e) => updateBusinessDetail("phone", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-plum">Business email <span className="font-normal text-plum/40">(optional)</span></label>
              <input name="email" type="email" placeholder="ade@example.com" className={inputClass} autoComplete="email" value={businessDetails.email} onChange={(e) => updateBusinessDetail("email", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-plum">Location <span className="font-normal text-plum/40">(optional)</span></label>
              <input name="address" placeholder="Ibadan, Oyo State" className={inputClass} autoComplete="street-address" value={businessDetails.address} onChange={(e) => updateBusinessDetail("address", e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-plum">What do you do? <span className="font-normal text-plum/40">(optional)</span></label>
            <textarea name="description" rows={3} placeholder="Phone repairs, accessories and screen replacements..." className="w-full rounded-2xl border border-plum/12 bg-white px-4 py-3 text-[15px] text-plum placeholder:text-plum/35 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20" value={businessDetails.description} onChange={(e) => updateBusinessDetail("description", e.target.value)} />
          </div>

          {error && <p role="alert" className="text-sm leading-5 text-terracotta">{error}</p>}
          <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-plum px-6 text-sm font-bold text-white hover:bg-plum-deep">Continue <ArrowRight size={16} /></button>
        </>
      ) : (
        <>
          <div>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-pale-sage text-plum"><Landmark size={20} /></div>
            <h2 className="font-heading text-xl font-extrabold text-plum">How do customers pay you?</h2>
            <p className="mt-1 text-sm leading-6 text-plum/55">Choose the methods you want to show on your invoices. You can change these later.</p>
          </div>

          <div className="grid gap-3">
            {[
              { key: "bankTransfer" as const, title: "Bank transfer", description: "Customers transfer directly to your bank account.", icon: Landmark },
              { key: "cash" as const, title: "Cash", description: "Record cash payments when you receive them.", icon: Banknote },
              { key: "pos" as const, title: "POS", description: "Record payments made through your POS terminal.", icon: CreditCard },
            ].map(({ key, title, description, icon: Icon }) => (
              <button type="button" key={key} onClick={() => toggleMethod(key)} className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition-colors ${methods[key] ? "border-terracotta bg-terracotta/5" : "border-plum/10 bg-white hover:border-plum/20"}`} aria-pressed={methods[key]}>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${methods[key] ? "bg-terracotta text-white" : "bg-pale-sage text-plum"}`}><Icon size={18} /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3"><span className="font-heading text-sm font-extrabold text-plum">{title}</span><span className={`flex h-5 w-5 items-center justify-center rounded-full border ${methods[key] ? "border-terracotta bg-terracotta text-white" : "border-plum/20 bg-white"}`}>{methods[key] && <Check size={12} />}</span></span>
                  <span className="mt-1 block text-xs leading-5 text-plum/50">{description}</span>
                </span>
              </button>
            ))}
          </div>

          {methods.bankTransfer && (
            <div className="rounded-2xl border border-plum/10 bg-[#F8F8F6] p-4 sm:p-5">
              <p className="text-sm font-bold text-plum">Bank details</p>
              <p className="mt-1 text-xs leading-5 text-plum/50">These details will appear on invoices when bank transfer is enabled.</p>
              <div className="mt-4 grid gap-4">
                <input name="bankName" required placeholder="Bank name e.g. GTBank" className={inputClass} autoComplete="off" />
                <input name="accountName" required placeholder="Account name" className={inputClass} autoComplete="off" />
                <input name="accountNumber" required inputMode="numeric" pattern="[0-9]{10}" maxLength={10} placeholder="10-digit account number" className={`${inputClass} font-mono tracking-[0.08em]`} autoComplete="off" />
                <p className="text-[11px] leading-5 text-plum/45">OpenBooks will display the details you provide. We do not move or hold these funds.</p>
              </div>
            </div>
          )}

          {error && <p role="alert" className="text-sm leading-5 text-terracotta">{error}</p>}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => { setError(""); setStep(1); }} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-plum/10 bg-white px-5 text-sm font-bold text-plum hover:bg-pale-sage"><ArrowLeft size={16} /> Back</button>
            <button type="submit" disabled={loading} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-plum px-6 text-sm font-bold text-white hover:bg-plum-deep disabled:opacity-60">{loading ? "Creating your business…" : "Create my business"} <ArrowRight size={16} /></button>
          </div>
        </>
      )}
    </form>
  );
}
