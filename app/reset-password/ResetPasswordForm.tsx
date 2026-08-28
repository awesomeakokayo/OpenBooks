"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const response = await fetch("/api/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not reset your password.");
        return;
      }
      router.push("/login?reset=success");
      router.refresh();
    } catch {
      setError("Could not reset your password. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-7 flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-[#6F6670]">New password</span>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={8} required autoComplete="new-password" className="h-[52px] rounded-2xl border border-[#E5E3DF] bg-[#F8F8F6] px-4 text-[15px] text-[#503047] placeholder:text-[#918A91] focus:border-[#C05746] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C05746]/15" placeholder="At least 8 characters" />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-[#6F6670]">Confirm password</span>
        <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" minLength={8} required autoComplete="new-password" className="h-[52px] rounded-2xl border border-[#E5E3DF] bg-[#F8F8F6] px-4 text-[15px] text-[#503047] placeholder:text-[#918A91] focus:border-[#C05746] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C05746]/15" placeholder="Enter it again" />
      </label>
      {error && <p role="alert" className="text-sm leading-6 text-[#B42318]">{error}</p>}
      <button disabled={loading} className="mt-2 h-14 rounded-2xl bg-[#C05746] text-sm font-semibold text-white disabled:opacity-60">
        {loading ? "Updating…" : "Set new password"}
      </button>
    </form>
  );
}
