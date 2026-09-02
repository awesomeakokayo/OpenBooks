"use client";

import { Download } from "lucide-react";

export function InvoicePdfButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-16 min-h-16 w-full flex-1 items-center justify-center gap-2 rounded-[12px] bg-terracotta px-6 text-sm font-semibold !text-white shadow-[0_10px_24px_rgba(192,87,70,0.16)] transition hover:bg-terracotta-dark focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-2 sm:h-14 sm:min-h-14 print:hidden"
    >
      <Download size={19} className="text-white" />
      Download PDF
    </button>
  );
}
