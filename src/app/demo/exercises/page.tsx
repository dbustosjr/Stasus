"use client";

import Link from "next/link";
import { CategoryBadge } from "@/components/app-shell";
import { useDemo } from "@/components/demo/demo-provider";
import { demoPath } from "@/lib/demo/paths";
import {
  CATEGORY_META,
  EXERCISE_CATEGORIES,
} from "@/lib/exercises/types";

export default function DemoExercisesPage() {
  const { state } = useDemo();
  const byCategory = EXERCISE_CATEGORIES.map((category) => ({
    category,
    meta: CATEGORY_META[category],
    items: state.exercises.filter((e) => e.category === category),
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
            href={demoPath("/calm")}
            className="font-semibold text-[var(--stasus-teal)] dark:text-[var(--stasus-aqua)]"
          >
            calm tools
          </Link>
          .
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {byCategory.map(({ category, meta, items }) => (
          <section key={category} className="flex flex-col gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold text-[var(--stasus-ink)]">
                  {meta.label}
                </h2>
                <CategoryBadge category={category} />
              </div>
              <p className="mt-1 text-sm text-[var(--stasus-ink-muted)]">
                {meta.summary}
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {items.map((exercise) => (
                <li key={exercise.id}>
                  <Link
                    href={demoPath(`/exercises/${exercise.id}`)}
                    className="flex h-full flex-col rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-5 py-4 transition-colors hover:border-[var(--stasus-teal-secondary)]"
                  >
                    <span className="font-semibold text-[var(--stasus-ink)]">
                      {exercise.title}
                    </span>
                    {exercise.description ? (
                      <span className="mt-2 line-clamp-3 text-sm text-[var(--stasus-ink-muted)]">
                        {exercise.description}
                      </span>
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
