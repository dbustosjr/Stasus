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
        <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--stasus-ink)] sm:text-4xl">
          Welcome back
        </h1>
        <p className="mt-2 max-w-xl text-[var(--stasus-ink-muted)]">
          Pick up wherever feels doable today — practice, a quick log, or a
          calm minute. Nothing here is a scorecard.
        </p>
      </div>

      {suggested.length > 0 ? (
        <section className="border-y border-[var(--stasus-border)] py-5">
          <h2 className="text-sm font-semibold tracking-wide text-[var(--stasus-ink)]">
            A place to start
          </h2>
          <p className="mt-1 text-sm text-[var(--stasus-ink-muted)]">
            From what you shared in onboarding — optional, not homework.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggested.map((category) => (
              <Link
                key={category}
                href="/app/exercises"
                className="cursor-pointer rounded-full bg-[color-mix(in_srgb,var(--stasus-aqua)_22%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--stasus-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_34%,transparent)]"
              >
                {CATEGORY_META[category].label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <nav className="flex flex-col divide-y divide-[var(--stasus-border)] border-y border-[var(--stasus-border)]" aria-label="Shortcuts">
        {[
          {
            href: "/app/exercises",
            title: "Exercises",
            body: "Habituation, gaze, balance, and canalith orientation — at your pace.",
          },
          {
            href: "/app/tracker",
            title: "Tracker",
            body: "Log how things felt, how long, and what may have stirred them.",
          },
          {
            href: "/app/calm",
            title: "Calm",
            body: "Small tools for the checking loop and a steadier breath.",
          },
          {
            href: "/app/insights",
            title: "Weekly notes",
            body: "A quiet summary once a week — never after every log.",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex cursor-pointer items-baseline justify-between gap-4 py-5 transition-colors hover:text-[var(--stasus-teal-secondary)]"
          >
            <div>
              <h2 className="font-display text-xl font-medium text-[var(--stasus-ink)] group-hover:text-[var(--stasus-teal-secondary)]">
                {item.title}
              </h2>
              <p className="mt-1 text-sm text-[var(--stasus-ink-muted)]">
                {item.body}
              </p>
            </div>
            <span
              aria-hidden
              className="text-lg text-[var(--stasus-ink-muted)] transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        ))}
      </nav>

      <section className="py-2">
        <h2 className="text-sm font-semibold text-[var(--stasus-ink)]">
          Profile
        </h2>
        <dl className="mt-3 grid gap-3 text-sm">
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
