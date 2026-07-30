"use client";

import { useActionState } from "react";
import {
  createSymptomLog,
  type TrackerFormState,
} from "@/app/actions/tracker";
import { PRESET_TRIGGERS, type CustomTrigger } from "@/lib/tracker/types";
import { RED_FLAG_SIGNALS } from "@/lib/ai/red-flag";

const initial: TrackerFormState = { error: null };

export function SymptomLogForm({
  customTriggers,
}: {
  customTriggers: CustomTrigger[];
}) {
  const [state, formAction, pending] = useActionState(
    createSymptomLog,
    initial,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--stasus-ink)]">
        Severity (1–10)
        <input
          name="severity"
          type="number"
          min={1}
          max={10}
          required
          defaultValue={5}
          className="h-12 rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-mist)] px-4 dark:bg-[var(--stasus-surface)]"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--stasus-ink)]">
        Duration (minutes, optional)
        <input
          name="duration_minutes"
          type="number"
          min={0}
          placeholder="e.g. 30"
          className="h-12 rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-mist)] px-4 dark:bg-[var(--stasus-surface)]"
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-[var(--stasus-ink)]">
          Triggers (optional)
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {PRESET_TRIGGERS.map((trigger) => (
            <label
              key={trigger.id}
              className="flex items-center gap-2 rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-3 py-2 text-sm text-[var(--stasus-ink)]"
            >
              <input type="checkbox" name="triggers" value={trigger.id} />
              {trigger.label}
            </label>
          ))}
          {customTriggers.map((trigger) => (
            <label
              key={trigger.id}
              className="flex items-center gap-2 rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-3 py-2 text-sm text-[var(--stasus-ink)]"
            >
              <input
                type="checkbox"
                name="triggers"
                value={`custom:${trigger.label}`}
              />
              {trigger.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--stasus-ink)]">
        Add a custom trigger (optional)
        <input
          name="custom_trigger"
          type="text"
          maxLength={80}
          placeholder="e.g. Crowded store"
          className="h-12 rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-mist)] px-4 dark:bg-[var(--stasus-surface)]"
        />
      </label>

      <fieldset className="flex flex-col gap-2 rounded-2xl border border-[var(--stasus-teal-secondary)] bg-[color-mix(in_srgb,var(--stasus-aqua)_10%,var(--stasus-surface))] px-4 py-4">
        <legend className="px-1 text-sm font-semibold text-[var(--stasus-ink)]">
          Emergency check
        </legend>
        <p className="text-xs text-[var(--stasus-ink-muted)]">
          If sudden severe vertigo shows up with any of the signs below, saving
          will send you to emergency guidance. This is not a diagnosis.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {RED_FLAG_SIGNALS.map((signal) => (
            <label
              key={signal.id}
              className="flex items-center gap-2 rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-mist)] px-3 py-2 text-sm text-[var(--stasus-ink)] dark:bg-[var(--stasus-surface)]"
            >
              <input
                type="checkbox"
                name="red_flag_signals"
                value={signal.id}
              />
              {signal.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--stasus-ink)]">
        Notes (optional)
        <textarea
          name="notes"
          rows={4}
          maxLength={2000}
          placeholder="What you noticed. Keep it simple and kind to yourself."
          className="rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-mist)] px-4 py-3 dark:bg-[var(--stasus-surface)]"
        />
      </label>

      {state.error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--stasus-teal)] px-6 text-base font-semibold text-white disabled:opacity-60 dark:bg-[var(--stasus-aqua)] dark:text-[#001219]"
      >
        {pending ? "Saving…" : "Save entry"}
      </button>
    </form>
  );
}
