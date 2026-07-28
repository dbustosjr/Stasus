import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function EmergencyPage() {
  return (
    <div className="relative flex min-h-full flex-col bg-[var(--stasus-bg)]">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--stasus-ink-muted)]">
          Emergency redirect
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--stasus-ink)] md:text-4xl">
          Seek emergency care now
        </h1>
        <p className="text-lg leading-relaxed text-[var(--stasus-ink)]">
          The symptoms you marked can be associated with a medical emergency
          (including stroke). Stasus cannot evaluate emergencies and will not
          continue with normal wellness guidance for this entry.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-[var(--stasus-ink-muted)]">
          <li>Call your local emergency number immediately.</li>
          <li>If available, go to the nearest emergency department.</li>
          <li>Do not wait for an in-app insight or exercise recommendation.</li>
        </ul>
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="tel:911"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--stasus-teal)] px-6 text-base font-semibold text-white dark:bg-[var(--stasus-aqua)] dark:text-[#001219]"
          >
            Call emergency services
          </a>
          <Link
            href="/app/calm"
            className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-6 text-base font-semibold text-[var(--stasus-ink)]"
          >
            After you are safe — Calm tools
          </Link>
        </div>
        <p className="text-sm text-[var(--stasus-ink-muted)]">
          This screen is a hard-coded safety path. It is not a diagnosis.
        </p>
      </main>
    </div>
  );
}
