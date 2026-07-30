"use client";

import { useActionState } from "react";
import {
  logExerciseSession,
  type SessionFormState,
} from "@/app/actions/sessions";

const initial: SessionFormState = { error: null, ok: false };

export function LogSessionForm({ exerciseId }: { exerciseId: string }) {
  const [state, formAction, pending] = useActionState(
    logExerciseSession,
    initial,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-5 py-5"
    >
      <input type="hidden" name="exercise_id" value={exerciseId} />
      <h2 className="text-lg font-semibold text-[var(--stasus-ink)]">
        Log this practice
      </h2>
      <p className="text-sm text-[var(--stasus-ink-muted)]">
        Metadata only — no camera recording is stored. Missed days aren’t
        failures; log when you practice.
      </p>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-[var(--stasus-ink)]">
          Duration (optional)
        </legend>
        <p className="text-xs text-[var(--stasus-ink-muted)]">
          Use minutes, seconds, or both — for example 3 minutes, or 2 minutes
          and 30 seconds.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--stasus-ink)]">
            Minutes
            <input
              name="duration_minutes"
              type="number"
              min={0}
              max={180}
              step={1}
              inputMode="numeric"
              placeholder="e.g. 3"
              className="h-11 rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-mist)] px-4 dark:bg-[var(--stasus-bg)]"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--stasus-ink)]">
            Seconds
            <input
              name="duration_seconds"
              type="number"
              min={0}
              max={59}
              step={1}
              inputMode="numeric"
              placeholder="e.g. 30"
              className="h-11 rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-mist)] px-4 dark:bg-[var(--stasus-bg)]"
            />
          </label>
        </div>
      </fieldset>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--stasus-ink)]">
        Notes (optional)
        <textarea
          name="notes"
          rows={2}
          maxLength={500}
          placeholder="How it felt — keep it neutral."
          className="rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-mist)] px-4 py-2 dark:bg-[var(--stasus-bg)]"
        />
      </label>
      {state.error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-[var(--stasus-ink-muted)]">
          Practice logged. Nice work showing up.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-fit items-center justify-center rounded-full bg-[var(--stasus-teal)] px-5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-[var(--stasus-aqua)] dark:text-[#001219]"
      >
        {pending ? "Saving…" : "Mark practiced"}
      </button>
    </form>
  );
}
