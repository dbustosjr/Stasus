import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOnboarded } from "@/lib/auth/require-onboarded";
import { AppShell, CategoryBadge } from "@/components/app-shell";
import { PracticeCoach } from "@/components/cv/practice-coach";
import { LogSessionForm } from "@/components/log-session-form";
import { formatSessionDuration } from "@/lib/sessions/format-duration";
import {
  CATEGORY_META,
  type Exercise,
  type ExerciseCategory,
  type ExerciseInstructions,
} from "@/lib/exercises/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ExerciseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { insforge, user } = await requireOnboarded();

  const { data, error } = await insforge.database
    .from("exercises")
    .select(
      "id, category, condition_tags, title, description, instructions, difficulty_level, requires_cv_tracking, sort_order",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const exercise: Exercise = {
    id: String(data.id),
    category: data.category as ExerciseCategory,
    condition_tags: Array.isArray(data.condition_tags)
      ? (data.condition_tags as string[])
      : null,
    title: String(data.title),
    description: (data.description as string | null) ?? null,
    instructions: (data.instructions as ExerciseInstructions | null) ?? null,
    difficulty_level: (data.difficulty_level as number | null) ?? null,
    requires_cv_tracking: Boolean(data.requires_cv_tracking),
    sort_order: Number(data.sort_order ?? 0),
  };

  const meta = CATEGORY_META[exercise.category];
  const instructions = exercise.instructions;

  const { data: sessions } = await insforge.database
    .from("exercise_sessions")
    .select("id, completed_at, duration_seconds")
    .eq("user_id", user.id)
    .eq("exercise_id", id)
    .order("completed_at", { ascending: false })
    .limit(5);

  return (
    <AppShell email={user.email} active="exercises">
      <div>
        <Link
          href="/app/exercises"
          className="text-sm font-medium text-[var(--stasus-ink-muted)] hover:text-[var(--stasus-ink)]"
        >
          ← Back to library
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <CategoryBadge category={exercise.category} />
          {exercise.difficulty_level ? (
            <span className="text-sm text-[var(--stasus-ink-muted)]">
              Level {exercise.difficulty_level}
            </span>
          ) : null}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--stasus-ink)]">
          {exercise.title}
        </h1>
        {exercise.description ? (
          <p className="mt-3 max-w-2xl text-[var(--stasus-ink-muted)]">
            {exercise.description}
          </p>
        ) : null}
      </div>

      {meta.isManeuver ? (
        <div className="rounded-2xl border border-[var(--stasus-teal-secondary)] bg-[color-mix(in_srgb,var(--stasus-aqua)_14%,var(--stasus-surface))] px-5 py-4 text-sm text-[var(--stasus-ink)]">
          This is canalith orientation, not a daily exercise. Check with a
          clinician before trying any repositioning maneuver.
        </div>
      ) : null}

      {instructions?.duration_hint ? (
        <p className="text-sm font-medium text-[var(--stasus-ink)]">
          About {instructions.duration_hint}
        </p>
      ) : null}

      {instructions?.steps?.length ? (
        <section className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-6 py-6">
          <h2 className="text-lg font-semibold text-[var(--stasus-ink)]">
            Steps
          </h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-[var(--stasus-ink)]">
            {instructions.steps.map((step) => (
              <li key={step} className="pl-1 leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {instructions?.safety_notes?.length ? (
        <section className="rounded-2xl border border-[var(--stasus-border)] px-6 py-6">
          <h2 className="text-lg font-semibold text-[var(--stasus-ink)]">
            Safety notes
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--stasus-ink-muted)]">
            {instructions.safety_notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {exercise.requires_cv_tracking ? (
        <PracticeCoach
          exerciseId={exercise.id}
          category={exercise.category}
          title={exercise.title}
        />
      ) : null}

      <LogSessionForm exerciseId={exercise.id} />

      {sessions && sessions.length > 0 ? (
        <section className="rounded-2xl border border-[var(--stasus-border)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--stasus-ink)]">
            Your recent practices
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--stasus-ink-muted)]">
            {sessions.map((row) => {
              const s = row as {
                id: string;
                completed_at: string;
                duration_seconds: number | null;
              };
              return (
                <li key={s.id}>
                  {new Date(s.completed_at).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  {s.duration_seconds != null
                    ? ` · ${formatSessionDuration(s.duration_seconds)}`
                    : ""}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </AppShell>
  );
}
