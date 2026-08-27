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
      className="inline-flex h-11 flex-1 items-center justify-center rounded-[12px] border border-plum/10 bg-white px-6 text-sm font-semibold text-plum hover:bg-pale-sage"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
