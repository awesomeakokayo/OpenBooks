"use client";

import { useState } from "react";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) setError(typeof data.error === "string" ? data.error : "Could not request a password reset.");
      else setStatus(data.message || "If an account uses email/password, a reset link has been sent.");
    } catch {
      setError("Could not request a password reset. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-7 flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-[#6F6670]">Email address</span>
        <input value={email} onChange={(e) => setEmail(e.target.value)} name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="h-[52px] rounded-2xl border border-[#E5E3DF] bg-[#F8F8F6] px-4 text-[15px] text-[#503047] placeholder:text-[#918A91] focus:border-[#C05746] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C05746]/15" />
      </label>
      {error && <p role="alert" className="text-sm leading-6 text-[#B42318]">{error}</p>}
      {status && <p role="status" className="text-sm leading-6 text-[#36563A]">{status}</p>}
      <button disabled={loading} className="mt-2 h-14 rounded-2xl bg-[#C05746] text-sm font-semibold text-white disabled:opacity-60">
        {loading ? "Sending…" : "Send reset link"}
      </button>
      <Link href="/login" className="text-center text-sm font-semibold text-[#503047] underline underline-offset-4">Back to sign in</Link>
    </form>
  );
}
