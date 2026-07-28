import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";

export type ProfileRow = {
  onboarding_complete: boolean;
  condition_label: string | null;
  symptom_patterns: string[];
  suggested_categories: string[];
};

export async function requireOnboarded() {
  const { insforge, user } = await requireUser();

  const { data: profile } = await insforge.database
    .from("profiles")
    .select(
      "onboarding_complete, condition_label, symptom_patterns, suggested_categories",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_complete) {
    redirect("/app/onboarding");
  }

  const normalized: ProfileRow = {
    onboarding_complete: Boolean(profile.onboarding_complete),
    condition_label: (profile.condition_label as string | null) ?? null,
    symptom_patterns: Array.isArray(profile.symptom_patterns)
      ? (profile.symptom_patterns as string[])
      : [],
    suggested_categories: Array.isArray(profile.suggested_categories)
      ? (profile.suggested_categories as string[])
      : [],
  };

  return { insforge, user, profile: normalized };
}
