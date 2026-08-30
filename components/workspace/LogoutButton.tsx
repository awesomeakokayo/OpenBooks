"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);

    try {
      // Clear browser-side OpenBooks state so a logged-out visitor does not
      // retain navigation/UI state that could make the next visit feel like
      // an authenticated session.
      try {
        sessionStorage.clear();
        localStorage.removeItem("openbooks:last-business");
      } catch {
        // Storage may be unavailable in privacy-restricted browser contexts.
      }

      await signOut({ callbackUrl: "/" });
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      aria-label="Log out of OpenBooks"
      className={compact
        ? "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/65 transition-colors hover:bg-white/6 hover:text-white disabled:opacity-60"
        : "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/65 transition-colors hover:bg-white/6 hover:text-white disabled:opacity-60"}
    >
      <LogOut size={17} strokeWidth={1.9} />
      <span>{loading ? "Logging out…" : "Log out"}</span>
    </button>
  );
}
