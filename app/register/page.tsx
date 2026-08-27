import Link from "next/link";
import { RegisterForm } from "./RegisterForm";
import { OpenBooksBrandMark } from "@/components/openbooks-brand-mark";

export default function RegisterPage() {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#F8F8F6]">
      {/* soft blobs like landing hero */}
      <div className="pointer-events-none absolute -left-24 top-[-60px] h-96 w-96 rounded-full bg-[#C05746]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-10 h-[520px] w-[520px] rounded-full bg-[#ADC698]/15 blur-3xl" />

      <header className="relative z-10 mx-auto flex w-full max-w-[1320px] items-center justify-between px-5 py-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <OpenBooksBrandMark size={34} />
          <span className="font-heading text-lg font-bold tracking-tight text-[#503047]">
            Open<span className="text-[#503047]">Books</span>
          </span>
        </Link>
        <Link
          href="/login"
          className="hidden rounded-xl border border-[#E5E3DF] bg-white px-4 py-2.5 text-sm font-semibold text-[#503047] hover:bg-[#F8F8F6] sm:inline-flex"
        >
          Sign in
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-8 lg:px-8 lg:py-12">
        <div className="w-full max-w-[520px]">
          <div className="rounded-[32px] border border-[#E5E3DF] bg-white p-7 shadow-[0_25px_70px_rgba(80,48,71,0.12)] sm:p-9 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C05746]">Free · NGN-first · Open source</p>
            <h1 className="mt-3 font-heading text-[30px] font-extrabold leading-[0.98] tracking-[-0.04em] text-[#503047] sm:text-[32px]">
              Create your account
            </h1>
            <p className="mt-3 max-w-[36ch] text-sm leading-6 text-[#6F6670]">
              Your business notebook, now digital. Add one business and you are ready to keep customers, sales and invoices in one place.
            </p>

            <div className="mt-7">
              <RegisterForm />
            </div>

            <div className="mt-7 flex items-center gap-3">
              <span className="h-px flex-1 bg-[#E5E3DF]" />
              <span className="text-xs font-medium text-[#918A91]">Trusted by small businesses</span>
              <span className="h-px flex-1 bg-[#E5E3DF]" />
            </div>

            <p className="mt-6 text-center text-sm leading-6 text-[#6F6670]">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[#503047] underline decoration-[#E5E3DF] underline-offset-4 hover:text-[#C05746] hover:decoration-[#C05746]">
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-1 text-center text-xs text-[#918A91]">
            <span>Free to use</span>
            <span>•</span>
            <span>Built for phones</span>
            <span>•</span>
            <span>NGN-first</span>
            <span>•</span>
            <span>Your records are yours</span>
          </p>
        </div>
      </main>

      <footer className="relative z-10 border-t border-[#503047]/10 bg-white px-5 py-4 lg:px-8">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 text-center text-xs text-[#918A91] sm:flex-row sm:items-center sm:justify-between">
          <span>OpenBooks NG · Open source · Nigeria-first</span>
          <span>By signing up you agree to keep your business records simply and honestly.</span>
        </div>
      </footer>
    </div>
  );
}
