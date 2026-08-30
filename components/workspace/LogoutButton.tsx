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
      // Remove all browser-side OpenBooks state. The actual authentication
      // session is invalidated by Auth.js signOut below.
      try {
        sessionStorage.clear();
        localStorage.clear();
      } catch {
        // Storage may be unavailable in restricted browser contexts.
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
