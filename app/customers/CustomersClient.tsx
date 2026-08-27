"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function CustomersClient({ businessId, initialSearch }: { businessId: string; initialSearch: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(initialSearch);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set("search", value);
    else sp.delete("search");
    router.push(`/customers?${sp.toString()}`);
  }

  return (
    <form onSubmit={onSearch} className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by name or phone"
        className="flex-1 rounded-[12px] border border-plum/10 bg-white px-4 py-2.5 text-sm text-plum placeholder:text-plum/40 focus:border-terracotta focus:outline-none"
      />
      <button type="submit" className="rounded-[12px] bg-pale-sage px-5 text-sm font-semibold text-plum">
        Search
      </button>
    </form>
  );
}
