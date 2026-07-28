import Link from "next/link";
import { requireOnboarded } from "@/lib/auth/require-onboarded";
import { AppShell } from "@/components/app-shell";
import { CATEGORY_META, type ExerciseCategory } from "@/lib/exercises/types";

export default async function AppHomePage() {
  const { insforge, user, profile } = await requireOnboarded();

  const { data: recentSessions } = await insforge.database
    .from("exercise_sessions")
    .select("id, completed_at, exercise_id")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(3);

  const suggested = profile.suggested_categories.filter((c) =>
    ["habituation", "gaze_stabilization", "balance_training", "canalith_repositioning"].includes(
      c,
    ),
  ) as ExerciseCategory[];

  return (
    <AppShell email={user.email} active="home">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--stasus-ink)]">
          Your space
        </h1>
        <p className="mt-2 text-[var(--stasus-ink-muted)]">
          Practice, track, and use calm tools — at a pace that respects your
          system.
        </p>
      </div>

      {suggested.length > 0 ? (
        <section className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--stasus-ink)]">
            Suggested starting paths
          </h2>
          <p className="mt-1 text-sm text-[var(--stasus-ink-muted)]">
            Based on what you shared in onboarding — explore, don’t force.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggested.map((category) => (
              <Link
                key={category}
                href="/app/exercises"
                className="rounded-full bg-[color-mix(in_srgb,var(--stasus-aqua)_22%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--stasus-ink)]"
              >
                {CATEGORY_META[category].label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

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

      <Link
        href="/app/calm"
        className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-6 py-5 transition-colors hover:border-[var(--stasus-teal-secondary)]"
      >
        <h2 className="text-lg font-semibold text-[var(--stasus-ink)]">
          Calm tools
        </h2>
        <p className="mt-1 text-sm text-[var(--stasus-ink-muted)]">
          Fear–avoidance education, reframing symptom checking, grounding, and
          steady breathing.
        </p>
      </Link>

      <Link
        href="/app/insights"
        className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-6 py-5 transition-colors hover:border-[var(--stasus-teal-secondary)]"
      >
        <h2 className="text-lg font-semibold text-[var(--stasus-ink)]">
          Weekly insights
        </h2>
        <p className="mt-1 text-sm text-[var(--stasus-ink-muted)]">
          Pattern summaries on a weekly cadence — never after every log.
        </p>
      </Link>

      <section className="rounded-[1.5rem] border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-6 py-6">
        <h2 className="text-lg font-semibold text-[var(--stasus-ink)]">
          Profile
        </h2>
        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--stasus-ink-muted)]">Onboarding</dt>
            <dd className="font-medium text-[var(--stasus-ink)]">Complete</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--stasus-ink-muted)]">
              Condition label (optional)
            </dt>
            <dd className="font-medium text-[var(--stasus-ink)]">
              {profile.condition_label || "Not shared"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--stasus-ink-muted)]">Recent practices</dt>
            <dd className="font-medium text-[var(--stasus-ink)]">
              {recentSessions?.length
                ? `${recentSessions.length} logged recently`
                : "None yet"}
            </dd>
          </div>
        </dl>
      </section>
    </AppShell>
  );
}
