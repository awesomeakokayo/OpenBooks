import * as React from "react";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-plum text-white hover:bg-plum-deep shadow-[0_10px_28px_rgba(80,48,71,0.16)]",
  accent: "bg-terracotta text-white hover:bg-terracotta-dark shadow-[0_10px_28px_rgba(192,87,70,0.2)]",
  secondary: "bg-pale-sage text-plum hover:bg-sage",
  ghost: "bg-transparent text-plum hover:bg-pale-sage",
  outline: "border border-plum/10 bg-white text-plum hover:bg-pale-sage/40",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 rounded-xl px-3.5 text-xs",
  md: "h-11 rounded-xl px-5 text-sm",
  lg: "h-14 rounded-2xl px-7 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/25 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}
