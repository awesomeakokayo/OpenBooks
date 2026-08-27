const map: Record<string, string> = {
  PAID: "bg-pale-sage text-plum",
  SUCCESS: "bg-pale-sage text-plum",
  PARTIALLY_PAID: "bg-sage text-plum",
  DRAFT: "bg-plum/10 text-plum",
  SENT: "bg-plum/10 text-plum",
  VIEWED: "bg-plum/10 text-plum",
  OVERDUE: "bg-terracotta text-white",
  CANCELLED: "bg-plum/10 text-plum",
  PENDING: "bg-pale-sage text-plum/70",
  FAILED: "bg-terracotta text-white",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = map[status] ?? "bg-plum/10 text-plum";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${cls}`}
    >
      {status}
    </span>
  );
}
