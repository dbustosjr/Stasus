"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import {
  SYMPTOM_PATTERNS,
  categoriesFromPatterns,
} from "@/lib/onboarding/patterns";

export type OnboardingState = {
  error: string | null;
};

const patternIds = new Set(SYMPTOM_PATTERNS.map((p) => p.id as string));

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const { insforge, user } = await requireUser();

  const selected = formData
    .getAll("symptom_patterns")
    .map(String)
    .filter((id) => patternIds.has(id));

  const conditionRaw = String(formData.get("condition_label") ?? "").trim();
  const condition_label = conditionRaw ? conditionRaw.slice(0, 120) : null;
  const suggested = categoriesFromPatterns(selected);

  const { error } = await insforge.database
    .from("profiles")
    .update({
      symptom_patterns: selected,
      suggested_categories: suggested,
      condition_label,
      onboarding_complete: true,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/exercises");
  redirect("/app");
}
