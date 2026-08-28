"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Github } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password. Make sure your email is verified.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {resetSuccess && <div role="status" className="rounded-2xl border border-[#ADC698]/40 bg-[#D0E3C4]/45 px-4 py-3 text-sm leading-6 text-[#36563A]">Your password has been updated. Sign in with your new password.</div>}

      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-[0.02em] text-[#6F6670]">Email address</span>
        <span className="relative flex">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#918A91]"><Mail size={17} strokeWidth={2} /></span>
          <input name="email" type="email" required placeholder="you@example.com" autoComplete="email" className="flex h-[52px] w-full rounded-2xl border border-[#E5E3DF] bg-[#F8F8F6] pl-11 pr-4 text-[15px] font-medium text-[#503047] placeholder:text-[#918A91] focus:border-[#C05746] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C05746]/15" />
        </span>
      </label>

      <label className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-[0.02em] text-[#6F6670]">Password</span>
          <Link href="/forgot-password" className="text-xs font-medium text-[#918A91] hover:text-[#503047]">Forgot?</Link>
        </div>
        <span className="relative flex">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#918A91]"><Lock size={17} strokeWidth={2} /></span>
          <input name="password" type={showPassword ? "text" : "password"} required placeholder="••••••••" autoComplete="current-password" className="flex h-[52px] w-full rounded-2xl border border-[#E5E3DF] bg-[#F8F8F6] pl-11 pr-11 text-[15px] font-medium text-[#503047] placeholder:text-[#918A91] focus:border-[#C05746] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C05746]/15" />
          <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-[#918A91] hover:bg-white hover:text-[#503047]">
            {showPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
          </button>
        </span>
      </label>

      {error && <div role="alert" className="rounded-2xl border border-[#C05746]/15 bg-[#C05746]/5 px-4 py-3 text-sm leading-6 text-[#C05746]">{error}</div>}

      <button type="submit" disabled={loading} className="mt-1 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#C05746] px-7 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(192,87,70,0.28)] transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60">
        {loading ? "Signing in…" : <>Sign in <ArrowRight size={17} strokeWidth={2.2} /></>}
      </button>

      <div className="flex items-center gap-3 py-1"><span className="h-px flex-1 bg-[#E5E3DF]" /><span className="text-xs font-medium tracking-[0.04em] text-[#918A91]">or continue with</span><span className="h-px flex-1 bg-[#E5E3DF]" /></div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <button type="button" onClick={() => signIn("github", { callbackUrl: "/dashboard" })} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#E5E3DF] bg-white px-4 text-sm font-semibold text-[#503047] hover:bg-[#F8F8F6]"><Github size={17} strokeWidth={2} />GitHub</button>
        <button type="button" onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#E5E3DF] bg-white px-4 text-sm font-semibold text-[#503047] hover:bg-[#F8F8F6]"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F8F8F6] text-[11px] font-bold text-[#503047]">G</span>Google</button>
      </div>
    </form>
  );
}
