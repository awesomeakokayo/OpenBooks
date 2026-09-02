"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex h-16 min-h-16 w-full flex-1 items-center justify-center rounded-[12px] border border-plum/10 bg-white px-6 text-sm font-semibold text-plum shadow-[0_6px_18px_rgba(80,48,71,0.06)] transition hover:bg-pale-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum/20 focus-visible:ring-offset-2 sm:h-14 sm:min-h-14"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
