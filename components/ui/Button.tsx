import * as React from "react";

type Variant = "primary" | "accent" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-plum text-white hover:bg-plum/90",
  accent: "bg-terracotta text-white hover:bg-terracotta/90",
  secondary: "bg-pale-sage text-plum hover:bg-sage",
  ghost: "bg-transparent text-plum hover:bg-pale-sage",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-12 px-6 text-sm",
  lg: "h-14 px-8 text-base",
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
      className={`inline-flex items-center justify-center rounded-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/20 disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}
