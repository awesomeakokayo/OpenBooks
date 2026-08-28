import Link from "next/link";
import { Check, MailCheck, RefreshCw, XCircle } from "lucide-react";
import { OpenBooksBrandMark } from "@/components/openbooks-brand-mark";
import { ResendVerificationForm } from "./ResendVerificationForm";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; email?: string }>;
}) {
  const { status, email } = await searchParams;
  const success = status === "success";
  const invalid = status === "invalid";
  const rateLimited = status === "rate-limited";

  return (
    <main className="min-h-screen bg-[#F8F8F6] text-[#503047]">
      <header className="mx-auto flex w-full max-w-[1320px] items-center px-5 py-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <OpenBooksBrandMark size={34} />
          <span className="font-heading text-lg font-bold tracking-tight text-[#503047]">OpenBooks</span>
        </Link>
      </header>

      <section className="flex min-h-[calc(100vh-88px)] items-center justify-center px-5 py-12">
        <div className="w-full max-w-[560px] rounded-[32px] border border-[#E5E3DF] bg-white p-8 text-center shadow-[0_25px_70px_rgba(80,48,71,0.10)] sm:p-10">
          {success ? (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#D0E3C4] text-[#36563A]"><Check size={30} strokeWidth={2.5} /></div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#ADC698]">Email verified</p>
              <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-[-0.04em]">You're verified.</h1>
              <p className="mx-auto mt-4 max-w-[38ch] text-sm leading-6 text-[#6F6670]">Your OpenBooks account is ready. Sign in to continue setting up your business.</p>
              <Link href="/login" className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#C05746] px-6 text-sm font-semibold text-white">Continue to sign in</Link>
            </>
          ) : invalid ? (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FDECEC] text-[#B42318]"><XCircle size={30} /></div>
              <h1 className="mt-6 font-heading text-3xl font-extrabold tracking-[-0.04em]">That link is no longer valid.</h1>
              <p className="mx-auto mt-4 max-w-[40ch] text-sm leading-6 text-[#6F6670]">The verification link may have expired or already been used.</p>
              <ResendVerificationForm email={email} />
            </>
          ) : rateLimited ? (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF5D9] text-[#8A5A00]"><RefreshCw size={30} /></div>
              <h1 className="mt-6 font-heading text-3xl font-extrabold tracking-[-0.04em]">Please wait a moment.</h1>
              <p className="mx-auto mt-4 max-w-[40ch] text-sm leading-6 text-[#6F6670]">Too many verification attempts were made. Please try again shortly.</p>
              <Link href={`/verify-email${email ? `?email=${encodeURIComponent(email)}` : ""}`} className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl border border-[#E5E3DF] bg-white px-6 text-sm font-semibold text-[#503047]">Try again</Link>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#D0E3C4] text-[#503047]"><MailCheck size={30} /></div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#C05746]">Check your email</p>
              <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-[-0.04em]">Verify your OpenBooks account.</h1>
              <p className="mx-auto mt-4 max-w-[40ch] text-sm leading-6 text-[#6F6670]">We sent a verification link to {email ? <strong>{email}</strong> : "the email you used to create your account"}. Open it to continue.</p>
              <p className="mt-4 text-xs leading-5 text-[#918A91]">The link expires in 1 hour. Didn't receive it? Check spam or promotions, then request a new one below.</p>
              <ResendVerificationForm email={email} />
              <Link href="/login" className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl border border-[#E5E3DF] bg-white px-5 text-sm font-semibold text-[#503047] hover:bg-[#F8F8F6]">Back to sign in</Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
