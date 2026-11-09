"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { CategoryBadge } from "@/components/app-shell";
import { PracticeCameraEntry } from "@/components/cv/practice-camera-entry";
import { useDemo } from "@/components/demo/demo-provider";
import { LogSessionForm } from "@/components/log-session-form";
import { demoPath } from "@/lib/demo/paths";
import { CATEGORY_META } from "@/lib/exercises/types";
import { formatSessionDuration } from "@/lib/sessions/format-duration";
import type { SessionFormState } from "@/app/actions/sessions";

export default function DemoExerciseDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { state, addSession } = useDemo();
  const exercise = useMemo(
    () => state.exercises.find((e) => e.id === id) ?? null,
    [state.exercises, id],
  );

  if (!exercise) {
    return (
      <p className="text-sm text-[var(--stasus-ink-muted)]">
        Exercise not found.{" "}
        <Link
          href={demoPath("/exercises")}
          className="font-semibold text-[var(--stasus-aqua)]"
        >
          Back to library
        </Link>
      </p>
    );
  }

  const current = exercise;
  const meta = CATEGORY_META[current.category];
  const instructions = current.instructions;
  const sessions = state.sessions
    .filter((s) => s.exercise_id === current.id)
    .slice(0, 5);

  async function demoLogSession(
    _prev: SessionFormState,
    formData: FormData,
  ): Promise<SessionFormState> {
    const minutesRaw = String(formData.get("duration_minutes") ?? "").trim();
    const secondsRaw = String(formData.get("duration_seconds") ?? "").trim();
    const minutes = minutesRaw ? Number.parseInt(minutesRaw, 10) : 0;
    const seconds = secondsRaw ? Number.parseInt(secondsRaw, 10) : 0;
    const duration =
      (Number.isFinite(minutes) ? minutes : 0) * 60 +
      (Number.isFinite(seconds) ? seconds : 0);
    const notes = String(formData.get("notes") ?? "").trim() || null;
    addSession({
      exercise_id: current.id,
      duration_seconds: duration > 0 ? duration : null,
      rep_count: null,
      cv_confidence_avg: null,
      notes,
    });
    return { ok: true, error: null };
  }

  return (
    <>
      <div>
        <Link
          href={demoPath("/exercises")}
          className="text-sm font-medium text-[var(--stasus-ink-muted)] hover:text-[var(--stasus-ink)]"
        >
          ← Back to library
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <CategoryBadge category={current.category} />
          {current.difficulty_level ? (
            <span className="text-sm text-[var(--stasus-ink-muted)]">
              Level {current.difficulty_level}
            </span>
          ) : null}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--stasus-ink)]">
          {current.title}
        </h1>
        {current.description ? (
          <p className="mt-3 max-w-2xl text-[var(--stasus-ink-muted)]">
            {current.description}
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

      {current.requires_cv_tracking ? (
        <PracticeCameraEntry
          exerciseId={current.id}
          category={current.category}
          title={current.title}
          basePath="/demo"
        />
      ) : null}

      <LogSessionForm exerciseId={current.id} action={demoLogSession} />

      {sessions.length > 0 ? (
        <section className="rounded-2xl border border-[var(--stasus-border)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--stasus-ink)]">
            Your recent practices
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--stasus-ink-muted)]">
            {sessions.map((s) => (
              <li key={s.id}>
                {new Date(s.completed_at).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
                {s.duration_seconds != null
                  ? ` · ${formatSessionDuration(s.duration_seconds)}`
                  : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
