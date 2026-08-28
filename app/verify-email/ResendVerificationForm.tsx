"use client";

import { useState } from "react";

export function ResendVerificationForm({ email }: { email?: string }) {
  const [value, setValue] = useState(email || "");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/verify-email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not resend verification email.");
      } else {
        setStatus(typeof data.message === "string" ? data.message : "If verification is needed, a new email has been sent.");
      }
    } catch {
      setError("Could not resend verification email. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-6 flex max-w-[420px] flex-col gap-3 text-left">
      <label htmlFor="verification-email" className="text-xs font-semibold text-[#6F6670]">Email address</label>
      <input
        id="verification-email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        className="h-12 rounded-2xl border border-[#E5E3DF] bg-[#F8F8F6] px-4 text-sm text-[#503047] outline-none focus:border-[#C05746] focus:bg-white focus:ring-2 focus:ring-[#C05746]/15"
      />
      {error && <p role="alert" className="text-xs leading-5 text-[#B42318]">{error}</p>}
      {status && <p role="status" className="text-xs leading-5 text-[#36563A]">{status}</p>}
      <button disabled={loading} className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#503047] px-6 text-sm font-semibold text-white disabled:opacity-60">
        {loading ? "Sending…" : "Resend verification email"}
      </button>
    </form>
  );
}
