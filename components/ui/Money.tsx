import { formatNaira } from "@/lib/invoices/utils";

export function Money({
  amount,
  size = "md",
  className = "",
}: {
  amount: number | string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeMap: Record<string, string> = {
    sm: "text-sm font-semibold",
    md: "text-base font-bold",
    lg: "text-2xl font-bold",
    xl: "text-4xl font-extrabold",
  };
  return <span className={`${sizeMap[size]} text-plum ${className}`}>{formatNaira(amount)}</span>;
}
