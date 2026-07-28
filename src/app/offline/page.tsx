import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Offline · Stasus",
};

export default function OfflinePage() {
  return (
    <div className="relative flex min-h-full flex-col bg-[var(--stasus-bg)]">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--stasus-ink)]">
          You’re offline
        </h1>
        <p className="text-[var(--stasus-ink-muted)]">
          Stasus needs a connection to load your private tracker, exercises, and
          insights. Reconnect, then refresh — we don’t keep health data in an
          offline cache.
        </p>
        <Link
          href="/"
          className="inline-flex h-12 w-fit items-center justify-center rounded-full bg-[var(--stasus-teal)] px-6 text-base font-semibold text-white dark:bg-[var(--stasus-aqua)] dark:text-[#001219]"
        >
          Try again
        </Link>
      </main>
    </div>
  );
}
