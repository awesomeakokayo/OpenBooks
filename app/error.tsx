"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("OpenBooks route error", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F8F6] px-5 py-12 text-plum">
      <section className="w-full max-w-md rounded-3xl border border-plum/10 bg-white p-8 text-center shadow-[0_16px_40px_rgba(80,48,71,0.08)]">
        <p className="openbooks-eyebrow text-terracotta">Something went wrong</p>
        <h1 className="mt-3 font-heading text-2xl font-extrabold">We couldn't load this page.</h1>
        <p className="mt-2 text-sm leading-6 text-plum/55">Your data is not changed by this screen. Try again, or return to your workspace.</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button type="button" onClick={() => reset()} className="inline-flex h-11 items-center justify-center rounded-xl bg-plum px-5 text-sm font-bold text-white hover:bg-plum-deep">Try again</button>
          <a href="/dashboard" className="inline-flex h-11 items-center justify-center rounded-xl border border-plum/10 bg-white px-5 text-sm font-bold text-plum hover:bg-pale-sage">Dashboard</a>
        </div>
      </section>
    </main>
  );
}
