"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const form = new FormData(e.currentTarget);
      const password = String(form.get("password") || "");
      const confirmPassword = String(form.get("confirmPassword") || "");

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      const payload = {
        name: String(form.get("name") || "").trim(),
        email: String(form.get("email") || "").trim(),
        password,
        confirmPassword,
        phone: String(form.get("phone") || "").trim(),
      };

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.verificationRequired && data.email) {
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}&delivery=failed`);
          return;
        }
        setError(typeof data.error === "string" ? data.error : "Could not create account");
        return;
      }

      router.push(`/verify-email?email=${encodeURIComponent(payload.email)}`);
    } catch {
      setError("Could not create account. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function continueWith(provider: "google") {
    setError("");
    setLoading(true);
    await signIn(provider, { callbackUrl: "/dashboard" });
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => continueWith("google")}
        disabled={loading}
        className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-[#E5E3DF] bg-white px-4 text-sm font-semibold text-[#503047] hover:bg-[#F8F8F6] disabled:opacity-60"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F8F8F6] text-[15px] font-bold text-[#503047]">G</span>
        Continue with Google
      </button>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-[#E5E3DF]" />
        <span className="text-xs font-medium tracking-[0.04em] text-[#918A91]">or use your email</span>
        <span className="h-px flex-1 bg-[#E5E3DF]" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.02em] text-[#6F6670]">Full name</span>
          <span className="relative flex">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#918A91]"><User size={17} strokeWidth={2} /></span>
            <input name="name" required minLength={2} placeholder="Ade Johnson" autoComplete="name" className="flex h-[52px] w-full rounded-2xl border border-[#E5E3DF] bg-[#F8F8F6] pl-11 pr-4 text-[15px] font-medium text-[#503047] placeholder:text-[#918A91] focus:border-[#C05746] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C05746]/15" />
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.02em] text-[#6F6670]">Email address</span>
          <span className="relative flex">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#918A91]"><Mail size={17} strokeWidth={2} /></span>
            <input name="email" type="email" required placeholder="ade@example.com" autoComplete="email" className="flex h-[52px] w-full rounded-2xl border border-[#E5E3DF] bg-[#F8F8F6] pl-11 pr-4 text-[15px] font-medium text-[#503047] placeholder:text-[#918A91] focus:border-[#C05746] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C05746]/15" />
          </span>
          <span className="text-xs leading-4 text-[#918A91]">We'll use this to secure your account and help you recover access.</span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.02em] text-[#6F6670]">Phone number <span className="font-normal text-[#918A91]">(optional)</span></span>
          <span className="relative flex">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#918A91]"><Phone size={17} strokeWidth={2} /></span>
            <input name="phone" type="tel" inputMode="tel" placeholder="0803 000 0000" autoComplete="tel" className="flex h-[52px] w-full rounded-2xl border border-[#E5E3DF] bg-[#F8F8F6] pl-11 pr-4 text-[15px] font-medium text-[#503047] placeholder:text-[#918A91] focus:border-[#C05746] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C05746]/15" />
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-[0.02em] text-[#6F6670]">Password</span>
            <span className="text-xs font-medium text-[#918A91]">Min 8 characters</span>
          </div>
          <span className="relative flex">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#918A91]"><Lock size={17} strokeWidth={2} /></span>
            <input name="password" type={showPassword ? "text" : "password"} required minLength={8} placeholder="At least 8 characters" autoComplete="new-password" className="flex h-[52px] w-full rounded-2xl border border-[#E5E3DF] bg-[#F8F8F6] pl-11 pr-11 text-[15px] font-medium text-[#503047] placeholder:text-[#918A91] focus:border-[#C05746] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C05746]/15" />
            <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-[#918A91] hover:bg-white hover:text-[#503047]">
              {showPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
            </button>
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-[0.02em] text-[#6F6670]">Confirm password</span>
            <span className="text-xs font-medium text-[#918A91]">Re-enter your password</span>
          </div>
          <span className="relative flex">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#918A91]"><Lock size={17} strokeWidth={2} /></span>
            <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} required minLength={8} placeholder="Re-enter your password" autoComplete="new-password" className="flex h-[52px] w-full rounded-2xl border border-[#E5E3DF] bg-[#F8F8F6] pl-11 pr-11 text-[15px] font-medium text-[#503047] placeholder:text-[#918A91] focus:border-[#C05746] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C05746]/15" />
            <button type="button" aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"} onClick={() => setShowConfirmPassword((value) => !value)} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-[#918A91] hover:bg-white hover:text-[#503047]">
              {showConfirmPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
            </button>
          </span>
        </label>

        {error && <div role="alert" className="rounded-2xl border border-[#C05746]/15 bg-[#C05746]/5 px-4 py-3 text-sm leading-6 text-[#C05746]">{error}</div>}

        <button type="submit" disabled={loading} className="mt-1 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#C05746] px-7 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(192,87,70,0.28)] transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60">
          {loading ? "Creating account…" : <>Create account <ArrowRight size={17} strokeWidth={2.2} /></>}
        </button>

        <p className="flex items-center justify-center gap-2 text-center text-xs leading-5 text-[#918A91]">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D0E3C4] text-[#503047]"><Sparkles size={13} strokeWidth={2.2} /></span>
          <span>We'll verify your email before you start using your business workspace.</span>
        </p>
      </form>
    </div>
  );
}
