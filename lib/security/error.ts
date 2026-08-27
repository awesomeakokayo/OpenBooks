import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export function requestId(): string {
  return randomBytes(8).toString("hex");
}

// User-facing error never leaks secrets or stack traces
export function userError(message: string, status = 400, id?: string) {
  return NextResponse.json({ error: message, requestId: id || requestId() }, { status });
}

// Server log with structured context — never log PAYSTACK_SECRET, DATABASE_URL
export function logError(scope: string, err: unknown, context: Record<string, unknown> = {}) {
  const id = requestId();
  const message = err instanceof Error ? err.message : String(err);
  // Redact secrets if accidentally present
  const safeContext = JSON.stringify(context).replace(/(sk_live|sk_test|DATABASE_URL)[^"\s]*/g, "[REDACTED]");
  console.error(`[${scope}:${id}] ${message} ${safeContext}`);
  return id;
}
