import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { OpenBooksBrandMark } from "@/components/openbooks-brand-mark";

const messages: Record<string, { title: string; body: string }> = {
  OAuthAccountNotLinked: {
    title: "This login is already associated with another sign-in method.",
    body: "Sign in with the method you originally used for OpenBooks. Automatic account linking is disabled for security.",
  },
  AccessDenied: {
    title: "Sign-in was not completed.",
    body: "The sign-in provider did not allow the request to continue. Please try again.",
  },
  Configuration: {
    title: "Sign-in is not configured yet.",
    body: "This sign-in method needs to be configured by the OpenBooks administrator before it can be used.",
  },
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = messages[error || ""] ?? {
    title: "We couldn't complete sign-in.",
    body: "Please try again or use another sign-in method.",
  };

  return (
    <main className="min-h-screen bg-[#F8F8F6] text-[#503047]">
      <header className="mx-auto flex w-full max-w-[1320px] items-center px-5 py-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <OpenBooksBrandMark size={34} />
          <span className="font-heading text-lg font-bold tracking-tight">OpenBooks</span>
        </Link>
      </header>

      <section className="flex min-h-[calc(100vh-88px)] items-center justify-center px-5 py-10">
        <div className="w-full max-w-[520px] rounded-[32px] border border-[#E5E3DF] bg-white p-8 text-center shadow-[0_25px_70px_rgba(80,48,71,0.10)] sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF5D9] text-[#8A5A00]">
            <AlertTriangle size={30} />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#C05746]">Sign-in issue</p>
          <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-[-0.04em]">{message.title}</h1>
          <p className="mx-auto mt-4 max-w-[40ch] text-sm leading-6 text-[#6F6670]">{message.body}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#C05746] px-6 text-sm font-semibold text-white">Back to sign in</Link>
            <Link href="/" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#E5E3DF] bg-white px-6 text-sm font-semibold text-[#503047]"><ArrowLeft size={16} /> Home</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
