"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function CustomersClient({ businessId, initialSearch }: { businessId: string; initialSearch: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(initialSearch);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams(params.toString());
    if (value.trim()) sp.set("search", value.trim());
    else sp.delete("search");
    const query = sp.toString();
    router.push(query ? `/customers?${query}` : "/customers");
  }

  return (
    <div className="rounded-2xl border border-plum/10 bg-white p-3 shadow-[0_8px_24px_rgba(80,48,71,0.04)] sm:p-4">
      <form onSubmit={onSearch} className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-plum/35" size={17} />
          <input
            aria-label="Search customers"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search by name or phone"
            className="h-11 w-full rounded-xl border border-plum/10 bg-[#F8F8F6] pl-10 pr-3 text-sm font-medium text-plum placeholder:text-plum/35 outline-none transition focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10"
          />
        </div>
        <button type="submit" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-plum px-4 text-sm font-bold !text-white transition hover:bg-plum-deep">
          <Search size={16} className="text-white" />
          <span className="hidden sm:inline text-white">Search</span>
        </button>
        <button type="button" aria-label="Search filters" className="hidden h-11 w-11 items-center justify-center rounded-xl border border-plum/10 bg-white text-plum/55 hover:bg-[#F8F8F6] sm:inline-flex">
          <SlidersHorizontal size={17} />
        </button>
      </form>
    </div>
  );
}
