/** Bump when research scope language changes; requires re-consent. */
export const RESEARCH_CONSENT_VERSION = "2026-08-03";

export const RESEARCH_CONSENT_SCOPE = "deidentified_aggregate_research" as const;

export type ResearchConsentRow = {
  id: string;
  consent_version: string;
  scope: string;
  consented_at: string | null;
  revoked_at: string | null;
};

export function isResearchConsentActive(
  row: ResearchConsentRow | null | undefined,
): boolean {
  if (!row) return false;
  if (row.consent_version !== RESEARCH_CONSENT_VERSION) return false;
  if (!row.consented_at) return false;
  if (row.revoked_at) return false;
  return true;
}
