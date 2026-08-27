import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="mx-auto flex w-full max-w-[1320px] items-center gap-2 px-6 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-plum text-sm font-bold text-white">
          OB
        </div>
        <span className="font-heading text-lg font-bold text-plum">OpenBooks NG</span>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-[420px] rounded-[20px] border border-plum/10 bg-white p-8 shadow-[0_12px_40px_rgba(80,48,71,0.08)]">
          <h1 className="font-heading text-2xl font-bold text-plum">Welcome back</h1>
          <p className="mt-1 text-sm text-plum/60">Sign in to your business workspace.</p>
          <div className="mt-6">
            <LoginForm />
          </div>
          <p className="mt-6 text-center text-sm text-plum/60">
            No account?{" "}
            <Link href="/register" className="font-semibold text-terracotta hover:text-plum">
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
