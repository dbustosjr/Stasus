"use client";

import { useActionState } from "react";
import {
  grantResearchConsent,
  revokeResearchConsent,
  type ResearchConsentState,
} from "@/app/actions/research-consent";
import { RESEARCH_CONSENT_VERSION } from "@/lib/research/consent";

const initial: ResearchConsentState = { error: null };

type ResearchConsentManagerProps = {
  active: boolean;
  consentedAt: string | null;
};

export function ResearchConsentManager({
  active,
  consentedAt,
}: ResearchConsentManagerProps) {
  const [grantState, grantAction, grantPending] = useActionState(
    grantResearchConsent,
    initial,
  );
  const [revokeState, revokeAction, revokePending] = useActionState(
    revokeResearchConsent,
    initial,
  );

  return (
    <section className="border-y border-[var(--stasus-border)] py-6">
      <h2 className="font-display text-xl font-medium text-[var(--stasus-ink)]">
        Research data consent
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--stasus-ink-muted)]">
        Opt in if you are comfortable with de-identified pattern use for
        product learning and future research. Free-text notes are never
        included. Version {RESEARCH_CONSENT_VERSION}.
      </p>
      <p className="mt-3 text-sm text-[var(--stasus-ink)]">
        Status:{" "}
        <span className="font-medium">
          {active
            ? `Opted in${consentedAt ? ` · ${new Date(consentedAt).toLocaleDateString()}` : ""}`
            : "Not opted in"}
        </span>
      </p>
      {(grantState.error || revokeState.error) && (
        <p role="alert" className="mt-2 text-sm text-red-300">
          {grantState.error || revokeState.error}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {active ? (
          <form action={revokeAction}>
            <button
              type="submit"
              disabled={revokePending}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-[var(--stasus-border)] px-5 text-sm font-medium text-[var(--stasus-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_16%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {revokePending ? "Updating…" : "Revoke consent"}
            </button>
          </form>
        ) : (
          <form action={grantAction}>
            <button
              type="submit"
              disabled={grantPending}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-[var(--stasus-aqua)] px-5 text-sm font-semibold text-[#001219] transition-colors hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_82%,white)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[var(--stasus-aqua)]"
            >
              {grantPending ? "Saving…" : "Opt in"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
