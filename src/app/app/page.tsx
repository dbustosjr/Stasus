import Link from "next/link";
import { requireUser } from "@/lib/auth/require-user";
import { AppShell } from "@/components/app-shell";

export default async function AppHomePage() {
  const { insforge, user } = await requireUser();

  const { data: profile } = await insforge.database
    .from("profiles")
    .select("onboarding_complete, condition_label")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <AppShell email={user.email} active="home">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--stasus-ink)]">
          Your space
        </h1>
        <p className="mt-2 text-[var(--stasus-ink-muted)]">
          A calm place to practice and track — starting with the exercise
          library.
        </p>
      </div>

      <Link
        href="/app/exercises"
        className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-6 py-5 transition-colors hover:border-[var(--stasus-teal-secondary)]"
      >
        <h2 className="text-lg font-semibold text-[var(--stasus-ink)]">
          Exercise library
        </h2>
        <p className="mt-1 text-sm text-[var(--stasus-ink-muted)]">
          Habituation, gaze stabilization, balance, and canalith orientation
          cards.
        </p>
      </Link>

      <Link
        href="/app/tracker"
        className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-6 py-5 transition-colors hover:border-[var(--stasus-teal-secondary)]"
      >
        <h2 className="text-lg font-semibold text-[var(--stasus-ink)]">
          Symptom tracker
        </h2>
        <p className="mt-1 text-sm text-[var(--stasus-ink-muted)]">
          Log severity, duration, presets, and custom triggers privately.
        </p>
      </Link>

      <section className="rounded-[1.5rem] border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-6 py-6">
        <h2 className="text-lg font-semibold text-[var(--stasus-ink)]">
          Profile
        </h2>
        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--stasus-ink-muted)]">Onboarding</dt>
            <dd className="font-medium text-[var(--stasus-ink)]">
              {profile?.onboarding_complete ? "Complete" : "Not started"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--stasus-ink-muted)]">
              Condition label (optional)
            </dt>
            <dd className="font-medium text-[var(--stasus-ink)]">
              {profile?.condition_label || "Not shared"}
            </dd>
          </div>
        </dl>
      </section>
    </AppShell>
  );
}
