"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import {
  RESEARCH_CONSENT_SCOPE,
  RESEARCH_CONSENT_VERSION,
} from "@/lib/research/consent";

export type ResearchConsentState = {
  error: string | null;
  ok?: boolean;
};

export async function grantResearchConsent(
  _prev: ResearchConsentState,
  _formData?: FormData,
): Promise<ResearchConsentState> {
  const { insforge, user } = await requireUser();
  const now = new Date().toISOString();

  const { data: existing } = await insforge.database
    .from("research_consent")
    .select("id, revoked_at")
    .eq("user_id", user.id)
    .eq("consent_version", RESEARCH_CONSENT_VERSION)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await insforge.database
      .from("research_consent")
      .update({
        consented_at: now,
        revoked_at: null,
        scope: RESEARCH_CONSENT_SCOPE,
      })
      .eq("id", existing.id)
      .eq("user_id", user.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await insforge.database.from("research_consent").insert([
      {
        user_id: user.id,
        consent_version: RESEARCH_CONSENT_VERSION,
        scope: RESEARCH_CONSENT_SCOPE,
        consented_at: now,
        revoked_at: null,
      },
    ]);
    if (error) return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/privacy");
  return { error: null, ok: true };
}

export async function revokeResearchConsent(
  _prev: ResearchConsentState,
  _formData?: FormData,
): Promise<ResearchConsentState> {
  const { insforge, user } = await requireUser();
  const now = new Date().toISOString();

  const { data: existing } = await insforge.database
    .from("research_consent")
    .select("id")
    .eq("user_id", user.id)
    .eq("consent_version", RESEARCH_CONSENT_VERSION)
    .maybeSingle();

  if (!existing?.id) {
    return { error: null, ok: true };
  }

  const { error } = await insforge.database
    .from("research_consent")
    .update({ revoked_at: now })
    .eq("id", existing.id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/app");
  revalidatePath("/app/privacy");
  return { error: null, ok: true };
}

/** Soft decline / dismiss of the prompt without granting consent. */
export async function dismissResearchConsentPrompt(): Promise<void> {
  const { insforge, user } = await requireUser();

  const { data: existing } = await insforge.database
    .from("research_consent")
    .select("id")
    .eq("user_id", user.id)
    .eq("consent_version", RESEARCH_CONSENT_VERSION)
    .maybeSingle();

  if (!existing?.id) {
    await insforge.database.from("research_consent").insert([
      {
        user_id: user.id,
        consent_version: RESEARCH_CONSENT_VERSION,
        scope: RESEARCH_CONSENT_SCOPE,
        consented_at: null,
        revoked_at: null,
      },
    ]);
  }

  revalidatePath("/app");
  revalidatePath("/app/privacy");
}
