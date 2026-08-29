"use client";

import { Download } from "lucide-react";

export function InvoicePdfButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-12 w-full flex-1 items-center justify-center gap-2 rounded-[12px] bg-terracotta px-6 text-sm font-semibold !text-white shadow-[0_10px_24px_rgba(192,87,70,0.16)] transition hover:bg-terracotta-dark sm:h-11 print:hidden"
    >
      <Download size={17} className="text-white" />
      Download PDF
    </button>
  );
}
