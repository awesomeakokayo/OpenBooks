export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F8F8F6] text-plum" aria-label="Loading" aria-busy="true">
      <div className="flex min-h-screen">
        <aside className="hidden w-[248px] shrink-0 border-r border-plum/10 bg-plum lg:block">
          <div className="h-[84px] border-b border-white/10 px-5 py-6">
            <div className="h-5 w-32 animate-pulse rounded-lg bg-white/15" />
          </div>
          <div className="space-y-2 px-4 py-6">
            <div className="h-16 animate-pulse rounded-2xl bg-white/10" />
            <div className="mt-5 h-3 w-20 animate-pulse rounded bg-white/10" />
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="h-11 animate-pulse rounded-xl bg-white/10" />
            ))}
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-8 pt-24 sm:px-6 lg:px-8 lg:pt-10">
          <div className="mx-auto max-w-[1180px] space-y-6">
            <div className="space-y-3">
              <div className="h-3 w-24 animate-pulse rounded bg-plum/10" />
              <div className="h-10 w-56 animate-pulse rounded-xl bg-plum/10" />
              <div className="h-4 w-72 animate-pulse rounded bg-plum/10" />
            </div>
            <div className="h-24 animate-pulse rounded-2xl bg-white shadow-[0_8px_24px_rgba(80,48,71,0.04)]" />
            <div className="h-72 animate-pulse rounded-3xl bg-white shadow-[0_12px_32px_rgba(80,48,71,0.05)]" />
          </div>
        </main>
      </div>
    </div>
  );
}
