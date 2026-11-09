"use client";

import Link from "next/link";
import { useDemo } from "@/components/demo/demo-provider";
import { DemoProtocolPanel } from "@/components/demo/demo-protocol-panel";
import { CATEGORY_META, type ExerciseCategory } from "@/lib/exercises/types";
import { demoPath } from "@/lib/demo/paths";

export default function DemoHomePage() {
  const { state } = useDemo();
  const { profile, sessions, protocols } = state;
  const activeProtocols = protocols.filter((p) => !p.ended_at);
  const recentEnded = protocols.filter((p) => p.ended_at).slice(0, 3);
  const suggested = profile.suggested_categories.filter((c) =>
    [
      "habituation",
      "gaze_stabilization",
      "balance_training",
      "canalith_repositioning",
    ].includes(c),
  ) as ExerciseCategory[];

  return (
    <>
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--stasus-ink)] sm:text-4xl">
          Welcome back
        </h1>
        <p className="mt-2 max-w-xl text-[var(--stasus-ink-muted)]">
          Start wherever feels doable: a short practice, a quick log, or a calm
          minute. Nothing here is a scorecard.
        </p>
      </div>

      <DemoProtocolPanel active={activeProtocols} recentEnded={recentEnded} />

      {suggested.length > 0 ? (
        <section className="border-y border-[var(--stasus-border)] py-5">
          <h2 className="text-sm font-semibold tracking-wide text-[var(--stasus-ink)]">
            A place to start
          </h2>
          <p className="mt-1 text-sm text-[var(--stasus-ink-muted)]">
            Based on what you shared when you signed up. Totally optional.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggested.map((category) => (
              <Link
                key={category}
                href={demoPath("/exercises")}
                prefetch
                className="cursor-pointer rounded-full bg-[color-mix(in_srgb,var(--stasus-aqua)_22%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--stasus-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_34%,transparent)] active:scale-[0.98]"
              >
                {CATEGORY_META[category].label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <nav
        className="flex flex-col divide-y divide-[var(--stasus-border)] border-y border-[var(--stasus-border)]"
        aria-label="Shortcuts"
      >
        {[
          {
            href: demoPath("/exercises"),
            title: "Exercises",
            body: "Gaze, balance, habituation, and BPPV orientation. Go at your own pace.",
          },
          {
            href: demoPath("/tracker"),
            title: "Tracker",
            body: "Note how things felt, how long it lasted, and what might have set it off.",
          },
          {
            href: demoPath("/calm"),
            title: "Calm",
            body: "Simple tools for when you catch yourself checking symptoms again.",
          },
          {
            href: demoPath("/insights"),
            title: "Weekly notes",
            body: "A short weekly note when you want one, not after every log.",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            className="group flex min-h-11 cursor-pointer items-baseline justify-between gap-4 rounded-sm py-5 transition-colors hover:text-[var(--stasus-teal-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)] active:scale-[0.98]"
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
              What you shared (optional)
            </dt>
            <dd className="font-medium text-[var(--stasus-ink)]">
              {profile.condition_label || "Nothing yet"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--stasus-ink-muted)]">Recent practices</dt>
            <dd className="font-medium text-[var(--stasus-ink)]">
              {sessions.length ? `${Math.min(sessions.length, 3)} lately` : "None yet"}
            </dd>
          </div>
        </dl>
      </section>
    </>
  );
}
