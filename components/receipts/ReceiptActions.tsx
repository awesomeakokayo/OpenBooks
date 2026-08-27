"use client";

export function ReceiptActions({ receiptNumber, businessName, amount, paymentMethod }: { receiptNumber: string; businessName: string; amount: number; paymentMethod: string }) {
  return (
    <div className="mt-8 flex gap-2 print:hidden">
      <button onClick={() => window.print()} className="flex-1 rounded-[12px] bg-plum px-6 py-3 text-sm font-semibold text-white hover:bg-plum/90">
        Print / Save as PDF
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`Receipt ${receiptNumber} from ${businessName} — ₦${amount.toLocaleString("en-NG")} paid via ${paymentMethod}. View: ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 rounded-[12px] bg-sage px-6 py-3 text-center text-sm font-semibold text-plum hover:bg-sage/80"
      >
        Share via WhatsApp
      </a>
    </div>
  );
}
