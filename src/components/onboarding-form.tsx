"use client";

import { useActionState } from "react";
import {
  completeOnboarding,
  type OnboardingState,
} from "@/app/actions/onboarding";
import { SYMPTOM_PATTERNS } from "@/lib/onboarding/patterns";

const initial: OnboardingState = { error: null };

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(
    completeOnboarding,
    initial,
  );

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-6">
      <fieldset className="flex flex-col gap-3">
        <legend className="text-lg font-semibold text-[var(--stasus-ink)]">
          What are you experiencing?
        </legend>
        <p className="text-sm text-[var(--stasus-ink-muted)]">
          Select anything that fits. Nothing here diagnoses you — it only helps
          suggest a starting path.
        </p>
        <div className="flex flex-col gap-2">
          {SYMPTOM_PATTERNS.map((pattern) => (
            <label
              key={pattern.id}
              className="flex items-start gap-3 rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-4 py-3 text-sm text-[var(--stasus-ink)]"
            >
              <input
                type="checkbox"
                name="symptom_patterns"
                value={pattern.id}
                className="mt-1"
              />
              <span>{pattern.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--stasus-ink)]">
        Have you been told you have a specific condition? (optional)
        <input
          name="condition_label"
          type="text"
          maxLength={120}
          placeholder="Only if you’d like to share — e.g. PPPD, BPPV, vestibular migraine"
          className="h-12 rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-mist)] px-4 dark:bg-[var(--stasus-surface)]"
        />
      </label>

      {state.error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-[var(--stasus-aqua)] px-6 text-base font-semibold text-[#001219] transition-colors hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_82%,white)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[var(--stasus-aqua)]"
      >
        {pending ? "Saving…" : "Continue to Stasus"}
      </button>
    </form>
  );
}
