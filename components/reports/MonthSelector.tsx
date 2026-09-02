import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface MonthSelectorProps {
  basePath: string;
  selectedMonth: string;
  months: string[];
  labels: Record<string, string>;
  allTime?: boolean;
}

export function MonthSelector({ basePath, selectedMonth, months, labels, allTime = false }: MonthSelectorProps) {
  return (
    <div className="relative shrink-0">
      <label className="sr-only" htmlFor={`${basePath.replaceAll("/", "-")}-month`}>Select reporting month</label>
      <select
        id={`${basePath.replaceAll("/", "-")}-month`}
        value={selectedMonth}
        onChange={(event) => {
          window.location.href = `${basePath}?month=${encodeURIComponent(event.target.value)}`;
        }}
        className="h-10 w-full min-w-[185px] appearance-none rounded-xl border border-plum/10 bg-white pl-3 pr-9 text-xs font-bold text-plum outline-none transition hover:border-plum/20 focus:border-plum/30 focus:ring-2 focus:ring-plum/10 sm:w-auto"
      >
        {allTime ? <option value="all">All time</option> : null}
        {months.map((month) => (
          <option key={month} value={month}>{labels[month] ?? month}</option>
        ))}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-plum/45" />
      {allTime && selectedMonth === "all" ? (
        <Link href={`${basePath}?month=${months[0] ?? ""}`} className="sr-only">View latest month</Link>
      ) : null}
    </div>
  );
}
