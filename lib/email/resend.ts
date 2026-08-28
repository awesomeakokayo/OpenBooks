import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

export const RESEND_FROM = process.env.RESEND_FROM_EMAIL || "OpenBooks <verify@openbooks.ng>";

export function isEmailConfigured() {
  return Boolean(resend && process.env.RESEND_FROM_EMAIL);
}
