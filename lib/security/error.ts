import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export function requestId(): string {
  return randomBytes(8).toString("hex");
}

export function userError(message: string, status = 400, id = requestId()) {
  return NextResponse.json(
    { error: message, requestId: id },
    { status, headers: { "X-Request-ID": id, "Cache-Control": "no-store" } }
  );
}

// Server log with structured context — never log secrets, auth headers,
// reset tokens, or full bank details.
export function logError(scope: string, err: unknown, context: Record<string, unknown> = {}) {
  const id = requestId();
  const message = err instanceof Error ? err.message : String(err);
  const safeContext = JSON.stringify(context)
    .replace(/(sk_live|sk_test|DATABASE_URL|AUTH_SECRET|PAYSTACK_WEBHOOK_SECRET)[^"\s]*/gi, "[REDACTED]")
    .replace(/(authorization|cookie|token|accountNumber)[^,}\s]*/gi, "$1:[REDACTED]");
  console.error(`[${scope}:${id}] ${message} ${safeContext}`);
  return id;
}
