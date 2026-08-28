import Link from "next/link";
import { OpenBooksBrandMark } from "@/components/openbooks-brand-mark";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-[#F8F8F6] text-[#503047]">
      <header className="mx-auto flex w-full max-w-[1320px] items-center justify-between px-5 py-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <OpenBooksBrandMark size={34} />
          <span className="font-heading text-lg font-bold tracking-tight">OpenBooks</span>
        </Link>
        <Link href="/register" className="text-sm font-semibold text-[#503047] hover:text-[#C05746]">Create account</Link>
      </header>
      <section className="flex min-h-[calc(100vh-88px)] items-center justify-center px-5 py-12">
        <div className="w-full max-w-[520px] rounded-[32px] border border-[#E5E3DF] bg-white p-8 shadow-[0_25px_70px_rgba(80,48,71,0.10)] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C05746]">Account recovery</p>
          <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-[-0.04em]">Forgot your password?</h1>
          <p className="mt-4 max-w-[42ch] text-sm leading-6 text-[#6F6670]">Enter the email you use for OpenBooks. If you use email and password, we will send a link to choose a new password.</p>
          <ForgotPasswordForm />
        </div>
      </section>
    </main>
  );
}
