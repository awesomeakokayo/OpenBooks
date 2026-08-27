"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-plum">Email</label>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-[16px] text-plum placeholder:text-plum/40 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-plum">Password</label>
        <input
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="flex h-[48px] w-full rounded-[12px] border border-plum/12 bg-white px-4 text-[16px] text-plum placeholder:text-plum/40 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
        />
      </div>
      {error && <p className="text-sm text-terracotta">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 inline-flex h-12 items-center justify-center rounded-[12px] bg-plum px-6 text-sm font-semibold text-white hover:bg-plum/90 disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <div className="relative my-1 flex items-center gap-3">
        <div className="h-px flex-1 bg-plum/10" />
        <span className="text-xs text-plum/40">or</span>
        <div className="h-px flex-1 bg-plum/10" />
      </div>

      <button
        type="button"
        onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
        className="inline-flex h-12 items-center justify-center rounded-[12px] border border-plum/10 bg-white px-6 text-sm font-semibold text-plum hover:bg-pale-sage"
      >
        Continue with GitHub
      </button>
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="inline-flex h-12 items-center justify-center rounded-[12px] border border-plum/10 bg-white px-6 text-sm font-semibold text-plum hover:bg-pale-sage"
      >
        Continue with Google
      </button>
    </form>
  );
}
