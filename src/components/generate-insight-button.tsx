"use client";

import { useActionState } from "react";
import {
  generateWeeklyInsight,
  type InsightActionState,
} from "@/app/actions/insights";

const initial: InsightActionState = { error: null, ok: false };

export function GenerateInsightButton() {
  const [state, formAction, pending] = useActionState(
    generateWeeklyInsight,
    initial,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-fit cursor-pointer items-center justify-center rounded-full bg-[var(--stasus-teal)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--stasus-teal-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[var(--stasus-aqua)] dark:text-[#001219] dark:hover:bg-[#9ec9c6]"
      >
        {pending ? "Writing your note…" : "Write this week’s note"}
      </button>
      {state.error ? (
        <p
          role="alert"
          className="text-sm text-red-700 dark:text-red-300"
        >
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-[var(--stasus-ink-muted)]">
          Saved for this week.
        </p>
      ) : null}
    </form>
  );
}
