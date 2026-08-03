import Link from "next/link";
import { ResearchConsentManager } from "@/components/research-consent-manager";
import { requireOnboarded } from "@/lib/auth/require-onboarded";
import {
  isResearchConsentActive,
  RESEARCH_CONSENT_VERSION,
  type ResearchConsentRow,
} from "@/lib/research/consent";

export default async function AppPrivacyPage() {
  const { insforge, user } = await requireOnboarded();

  const { data } = await insforge.database
    .from("research_consent")
    .select("id, consent_version, scope, consented_at, revoked_at")
    .eq("user_id", user.id)
    .eq("consent_version", RESEARCH_CONSENT_VERSION)
    .maybeSingle();

  const row = (data as ResearchConsentRow | null) ?? null;
  const active = isResearchConsentActive(row);

  return (
    <>
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--stasus-ink)]">
          Privacy
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--stasus-ink-muted)]">
          Manage optional research consent. Your personal export and account
          delete stay in Account. Camera practice never uploads video.
        </p>
      </div>

      <ResearchConsentManager
        active={active}
        consentedAt={row?.consented_at ?? null}
      />

      <p className="text-sm text-[var(--stasus-ink-muted)]">
        Public policy:{" "}
        <Link
          href="/privacy/health-data"
          className="font-medium text-[var(--stasus-ink)] underline-offset-4 hover:underline"
        >
          Consumer Health Data Privacy Policy
        </Link>
      </p>
    </>
  );
}
