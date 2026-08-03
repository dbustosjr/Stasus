"use client";

import { useActionState, useTransition } from "react";
import {
  dismissResearchConsentPrompt,
  grantResearchConsent,
  type ResearchConsentState,
} from "@/app/actions/research-consent";
import { RESEARCH_CONSENT_VERSION } from "@/lib/research/consent";

const initial: ResearchConsentState = { error: null };

export function ResearchConsentPrompt() {
  const [state, action, pending] = useActionState(grantResearchConsent, initial);
  const [dismissPending, startDismiss] = useTransition();

  return (
    <section
      className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-4 py-4"
      aria-labelledby="research-consent-heading"
    >
      <h2
        id="research-consent-heading"
        className="text-sm font-semibold text-[var(--stasus-ink)]"
      >
        Optional research data
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--stasus-ink-muted)]">
        You can opt in so Stasus may use de-identified patterns from your
        logs and practice (never free-text notes) for product learning and
        future research. This is separate from using the app. You can change
        your mind anytime in Account → Privacy. Consent version{" "}
        {RESEARCH_CONSENT_VERSION}.
      </p>
      {state.error ? (
        <p role="alert" className="mt-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <form action={action}>
          <button
            type="submit"
            disabled={pending || dismissPending}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-[var(--stasus-aqua)] px-5 text-sm font-semibold text-[#001219] transition-colors hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_82%,white)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[var(--stasus-aqua)]"
          >
            {pending ? "Saving…" : "Opt in"}
          </button>
        </form>
        <button
          type="button"
          disabled={pending || dismissPending}
          onClick={() =>
            startDismiss(() => {
              void dismissResearchConsentPrompt();
            })
          }
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-[var(--stasus-border)] px-5 text-sm font-medium text-[var(--stasus-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_16%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {dismissPending ? "…" : "Not now"}
        </button>
      </div>
    </section>
  );
}
