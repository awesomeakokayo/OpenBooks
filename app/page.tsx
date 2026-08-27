import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      {/* Hero — style.md 77 */}
      <header className="mx-auto w-full max-w-[1320px] px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-plum flex items-center justify-center text-white font-bold text-sm">
            OB
          </div>
          <span className="font-heading font-bold text-plum text-lg">
            OpenBooks NG
          </span>
        </div>
        <Link
          href="/login"
          className="rounded-md bg-plum px-5 py-2.5 text-sm font-semibold text-white hover:bg-plum/90 transition-colors"
        >
          Sign in
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col px-6 py-12 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-6">
            <p className="text-sm font-semibold tracking-widest uppercase text-terracotta">
              Nigeria-first · Mobile-first · Open source
            </p>
            <h1
              className="font-heading font-extrabold text-plum leading-[1.1] text-[32px] lg:text-[48px]"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              Your business notebook,
              <br />
              <span className="text-sage">but digital.</span>
            </h1>
            <p className="max-w-xl text-[18px] leading-7 text-plum/70">
              Record sales, send invoices, collect payments and keep track of
              what your business is owed — without complicated accounting
              software.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row pt-2">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-[12px] bg-plum px-8 text-sm font-semibold text-white hover:bg-plum/90 transition-colors"
              >
                Start for free
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-[12px] bg-pale-sage px-8 text-sm font-semibold text-plum hover:bg-sage/60 transition-colors"
              >
                Sign in
              </Link>
            </div>
            <p className="text-sm text-plum/50">Free. No card required. NGN only — V1.</p>
          </div>

          {/* Decorative preview — pale sage panel */}
          <div className="rounded-[24px] bg-pale-sage p-6 lg:p-8 flex flex-col gap-4">
            <p className="text-sm font-semibold text-plum">Preview • Dashboard</p>
            <div className="rounded-[16px] bg-white p-5 shadow-[0_4px_20px_rgba(80,48,71,0.06)] border border-plum/10">
              <p className="text-sm font-medium text-plum/60">Good morning, Ade 👋</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-plum/50">Sales this month</p>
                  <p className="mt-1 text-2xl font-bold text-plum">₦184,500</p>
                </div>
                <div className="rounded-[12px] bg-pale-sage px-3 py-2">
                  <p className="text-xs font-medium text-plum/60">Customers owe you</p>
                  <p className="mt-1 text-lg font-bold text-plum">₦42,000</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <span className="rounded-full bg-plum px-3 py-1 text-xs font-semibold text-white">
                  + Record Sale
                </span>
                <span className="rounded-full bg-pale-sage px-3 py-1 text-xs font-semibold text-plum">
                  Create Invoice
                </span>
              </div>
            </div>
            <p className="text-xs text-plum/50">
              OpenBooks NG is not an accounting package — it is your simple digital
              cashbook. <span className="font-semibold text-plum">Record. Send. Get Paid. Grow.</span>
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-plum/10 py-6 text-center text-xs text-plum/50">
        OpenBooks NG • Open source • Built for Nigerian small businesses
      </footer>
    </div>
  );
}
