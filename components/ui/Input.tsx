import * as React from "react";

export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`flex h-[52px] w-full rounded-2xl border border-plum/10 bg-[#F8F8F6] px-4 text-[15px] font-medium text-plum outline-none placeholder:text-plum/35 transition-all focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

export function Label({ className = "", ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={`text-xs font-bold tracking-[0.02em] text-plum/65 ${className}`} {...props} />;
}
