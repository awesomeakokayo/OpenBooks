import * as React from "react";

export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-[16px] text-plum placeholder:text-plum/40 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 focus:outline-none disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

export function Label({ className = "", ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={`text-sm font-medium text-plum ${className}`} {...props} />;
}
