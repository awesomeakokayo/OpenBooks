"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function VerifyBanner() {
  const params = useSearchParams();
  const reference = params.get("reference") || params.get("trxref");
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "failed">("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!reference) return;
    setStatus("verifying");
    fetch("/api/payments/paystack/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMsg("Payment verified — thank you! Refreshing…");
          setTimeout(() => window.location.replace(window.location.pathname), 1500);
        } else {
          setStatus("failed");
          setMsg(data.error || "Could not verify payment yet. Webhook may still be processing.");
        }
      })
      .catch(() => {
        setStatus("failed");
        setMsg("Network error verifying payment.");
      });
  }, [reference]);

  if (!reference) return null;

  return (
    <div className={`rounded-[12px] p-4 text-sm ${status === "success" ? "bg-sage text-plum" : status === "verifying" ? "bg-pale-sage text-plum" : "bg-terracotta text-white"}`}>
      {status === "verifying" && <p>Confirming your payment… Please wait.</p>}
      {status === "success" && <p>✓ {msg}</p>}
      {status === "failed" && <p>We couldn&apos;t confirm this payment. {msg}</p>}
      {status === "idle" && <p>Verifying reference {reference}…</p>}
    </div>
  );
}
