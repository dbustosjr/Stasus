import Link from "next/link";
import { requireOnboarded } from "@/lib/auth/require-onboarded";
import { CategoryBadge } from "@/components/app-shell";
import {
  CATEGORY_META,
  EXERCISE_CATEGORIES,
  type Exercise,
  type ExerciseCategory,
} from "@/lib/exercises/types";

function asExercise(row: Record<string, unknown>): Exercise {
  return {
    id: String(row.id),
    category: row.category as ExerciseCategory,
    condition_tags: Array.isArray(row.condition_tags)
      ? (row.condition_tags as string[])
      : null,
    title: String(row.title),
    description: (row.description as string | null) ?? null,
    instructions: (row.instructions as Exercise["instructions"]) ?? null,
    difficulty_level: (row.difficulty_level as number | null) ?? null,
    requires_cv_tracking: Boolean(row.requires_cv_tracking),
    sort_order: Number(row.sort_order ?? 0),
  };
}

export default async function ExercisesPage() {
  const { insforge, user } = await requireOnboarded();
  const { data, error } = await insforge.database
    .from("exercises")
    .select(
      "id, category, condition_tags, title, description, instructions, difficulty_level, requires_cv_tracking, sort_order",
    )
    .order("sort_order", { ascending: true });

  const exercises = (data ?? []).map((row) =>
    asExercise(row as Record<string, unknown>),
  );

  const byCategory = EXERCISE_CATEGORIES.map((category) => ({
    category,
    meta: CATEGORY_META[category],
    items: exercises.filter((e) => e.category === category),
  }));

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--stasus-ink)]">
          Exercise library
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--stasus-ink-muted)]">
          Short practices for gaze, balance, habituation, and BPPV orientation.
          These are wellness tools, not a diagnosis or treatment plan. Go at your
          own pace. Stop if symptoms spike or you feel unsafe. If things feel
          louder afterward, try the{" "}
          <Link
            href="/app/calm"
            className="font-semibold text-[var(--stasus-teal)] dark:text-[var(--stasus-aqua)]"
          >
            calm tools
          </Link>
          .
        </p>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          Could not load exercises: {error.message}
        </p>
      ) : null}

      <div className="flex flex-col gap-10">
        {byCategory.map(({ category, meta, items }) => (
          <section key={category} className="flex flex-col gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold text-[var(--stasus-ink)]">
                  {meta.label}
                </h2>
                {meta.isManeuver ? (
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--stasus-ink-muted)]">
                    Orientation · not a daily routine
                  </span>
                ) : null}
              </div>
              <p className="mt-1 max-w-2xl text-sm text-[var(--stasus-ink-muted)]">
                {meta.summary}
              </p>
            </div>

            {meta.isManeuver ? (
              <div className="rounded-2xl border border-[var(--stasus-teal-secondary)] bg-[color-mix(in_srgb,var(--stasus-aqua)_14%,var(--stasus-surface))] px-5 py-4 text-sm text-[var(--stasus-ink)]">
                These cards explain canalith repositioning. They are not
                step-by-step home maneuvers. Check with a clinician before trying
                anything in this category.
              </div>
            ) : null}

            <ul className="grid gap-3 sm:grid-cols-2">
              {items.map((exercise) => (
                <li key={exercise.id}>
                  <Link
                    href={`/app/exercises/${exercise.id}`}
                    className="block rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-5 py-4 transition-colors hover:border-[var(--stasus-teal-secondary)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <CategoryBadge category={exercise.category} />
                      {exercise.difficulty_level ? (
                        <span className="text-xs text-[var(--stasus-ink-muted)]">
                          Level {exercise.difficulty_level}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-[var(--stasus-ink)]">
                      {exercise.title}
                    </h3>
                    {exercise.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--stasus-ink-muted)]">
                        {exercise.description}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
