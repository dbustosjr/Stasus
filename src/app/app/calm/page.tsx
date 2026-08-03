import Link from "next/link";
import { requireOnboarded } from "@/lib/auth/require-onboarded";
import { BreathingGuide } from "@/components/breathing-guide";
import {
  FearAvoidanceGuide,
  GroundingGuide,
  SymptomCheckingGuide,
} from "@/components/calm-guided-practice";
import {
  CALM_SECTIONS,
  EMERGENCY_CUES,
  FEAR_AVOIDANCE,
  GROUNDING,
  SYMPTOM_CHECKING,
} from "@/lib/calm/content";

export default async function CalmPage() {
  const { insforge, user } = await requireOnboarded();

  const { data: recentLogs } = await insforge.database
    .from("symptom_logs")
    .select("id, severity, logged_at")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .limit(5);

  const logs = recentLogs ?? [];
  const highRecent = logs.some(
    (row) => Number((row as { severity: number }).severity) >= 7,
  );

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--stasus-ink)]">
          Calm tools
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--stasus-ink-muted)]">
          Short guided practices for when symptoms and worry feed each other.
          Wellness helpers only — not therapy or a treatment plan.
        </p>
      </div>

      <section
        className="rounded-2xl border border-[var(--stasus-teal-secondary)] bg-[color-mix(in_srgb,var(--stasus-aqua)_12%,var(--stasus-surface))] px-5 py-4"
        aria-label={EMERGENCY_CUES.title}
      >
        <h2 className="text-sm font-semibold text-[var(--stasus-ink)]">
          {EMERGENCY_CUES.title}
        </h2>
        <p className="mt-1 text-sm text-[var(--stasus-ink-muted)]">
          {EMERGENCY_CUES.body}
        </p>
      </section>

      {highRecent ? (
        <section className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--stasus-ink)]">
            After a higher-severity log
          </h2>
          <p className="mt-1 text-sm text-[var(--stasus-ink-muted)]">
            You logged a severity of 7+ recently. If you are safe, try one
            grounding practice below, then one planned next step (rest or a
            gentle exercise). Skip the repeated checking.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
            <a
              href="#grounding"
              className="text-[var(--stasus-teal)] dark:text-[var(--stasus-aqua)]"
            >
              Go to grounding
            </a>
            <Link
              href="/app/exercises"
              className="text-[var(--stasus-teal)] dark:text-[var(--stasus-aqua)]"
            >
              Open exercises
            </Link>
            <Link
              href="/app/tracker"
              className="text-[var(--stasus-teal)] dark:text-[var(--stasus-aqua)]"
            >
              View tracker
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--stasus-ink)]">
            Alongside the rest of Stasus
          </h2>
          <p className="mt-1 text-sm text-[var(--stasus-ink-muted)]">
            Use these when you need them, then get back to your day. They are
            helpers, not a second full-time job.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
            <Link
              href="/app/tracker/new"
              className="text-[var(--stasus-teal)] dark:text-[var(--stasus-aqua)]"
            >
              Log once
            </Link>
            <Link
              href="/app/exercises"
              className="text-[var(--stasus-teal)] dark:text-[var(--stasus-aqua)]"
            >
              Practice library
            </Link>
          </div>
        </section>
      )}

      <nav className="flex flex-wrap gap-2" aria-label="Calm sections">
        {CALM_SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="cursor-pointer rounded-full border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-4 py-2 text-sm font-medium text-[var(--stasus-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_16%,transparent)]"
          >
            {section.title}
          </a>
        ))}
      </nav>

      <section id="fear-avoidance" className="scroll-mt-8 flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-[var(--stasus-ink)]">
          {FEAR_AVOIDANCE.title}
        </h2>
        <p className="max-w-2xl text-[var(--stasus-ink-muted)]">
          {FEAR_AVOIDANCE.intro}
        </p>
        <FearAvoidanceGuide />
      </section>

      <section id="symptom-checking" className="scroll-mt-8 flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-[var(--stasus-ink)]">
          {SYMPTOM_CHECKING.title}
        </h2>
        <p className="max-w-2xl text-[var(--stasus-ink-muted)]">
          {SYMPTOM_CHECKING.intro}
        </p>
        <SymptomCheckingGuide />
      </section>

      <section id="grounding" className="scroll-mt-8 flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-[var(--stasus-ink)]">
          {GROUNDING.title}
        </h2>
        <p className="max-w-2xl text-sm text-[var(--stasus-ink-muted)]">
          Pick a tool and move through it one step at a time.
        </p>
        <GroundingGuide />
      </section>

      <section id="breathing" className="scroll-mt-8 flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-[var(--stasus-ink)]">
          Steady breathing
        </h2>
        <BreathingGuide />
      </section>
    </>
  );
}
