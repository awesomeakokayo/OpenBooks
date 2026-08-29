"use client";

import { Download } from "lucide-react";

export function InvoicePdfButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[12px] bg-terracotta px-6 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(192,87,70,0.16)] transition hover:bg-terracotta-dark print:hidden"
    >
      <Download size={17} />
      Download PDF
    </button>
  );
}
