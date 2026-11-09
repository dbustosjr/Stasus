"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { PracticeCoach } from "@/components/cv/practice-coach";
import { useDemo } from "@/components/demo/demo-provider";
import { demoPath } from "@/lib/demo/paths";
import type { SessionFormState } from "@/app/actions/sessions";

export default function DemoExercisePracticePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { state, addSession } = useDemo();
  const exercise = useMemo(
    () => state.exercises.find((e) => e.id === id) ?? null,
    [state.exercises, id],
  );

  if (!exercise || !exercise.requires_cv_tracking) {
    return (
      <p className="text-sm text-[var(--stasus-ink-muted)]">
        Camera practice is not available for this exercise.{" "}
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
  const backHref = demoPath(`/exercises/${current.id}`);

  async function persistSession(
    formData: FormData,
  ): Promise<SessionFormState> {
    const durationRaw = String(formData.get("duration_seconds") ?? "");
    const duration = Number.parseInt(durationRaw, 10);
    const repRaw = String(formData.get("rep_count") ?? "").trim();
    const confRaw = String(formData.get("cv_confidence_avg") ?? "").trim();
    addSession({
      exercise_id: current.id,
      duration_seconds: Number.isFinite(duration) ? duration : null,
      rep_count: repRaw ? Number.parseInt(repRaw, 10) : null,
      cv_confidence_avg: confRaw ? Number.parseFloat(confRaw) : null,
      notes: null,
    });
    return { ok: true, error: null };
  }

  return (
    <>
      <div>
        <Link
          href={backHref}
          className="text-sm font-medium text-[var(--stasus-ink-muted)] hover:text-[var(--stasus-ink)]"
        >
          ← Back to {current.title}
        </Link>
        <h1 className="mt-4 font-display text-3xl font-medium tracking-tight text-[var(--stasus-ink)] sm:text-4xl">
          Camera practice
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--stasus-ink-muted)]">
          {current.title}. Give yourself a little more space from the screen so
          the camera can see you clearly. Video stays on this device.
        </p>
      </div>

      <PracticeCoach
        exerciseId={current.id}
        category={current.category}
        title={current.title}
        variant="page"
        backHref={backHref}
        persistSession={persistSession}
      />
    </>
  );
}
