"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import {
  parseCvConfidenceAvg,
  parseRepCount,
} from "@/lib/sessions/parse-cv-fields";

export type SessionFormState = {
  error: string | null;
  ok: boolean;
};

async function insertExerciseSession(
  formData: FormData,
): Promise<SessionFormState> {
  const { insforge, user } = await requireUser();

  const exerciseId = String(formData.get("exercise_id") ?? "");
  if (!exerciseId) {
    return { ok: false, error: "Missing exercise." };
  }

  const durationRaw = String(formData.get("duration_seconds") ?? "").trim();
  let duration_seconds: number | null = null;
  if (durationRaw) {
    duration_seconds = Number.parseInt(durationRaw, 10);
    if (!Number.isFinite(duration_seconds) || duration_seconds < 0) {
      return { ok: false, error: "Duration must be zero or more seconds." };
    }
  }

  const repParsed = parseRepCount(String(formData.get("rep_count") ?? ""));
  if (!repParsed.ok) {
    return { ok: false, error: repParsed.error };
  }

  const confidenceParsed = parseCvConfidenceAvg(
    String(formData.get("cv_confidence_avg") ?? ""),
  );
  if (!confidenceParsed.ok) {
    return { ok: false, error: confidenceParsed.error };
  }

  const notes = String(formData.get("notes") ?? "").trim() || null;

  const { error } = await insforge.database.from("exercise_sessions").insert([
    {
      user_id: user.id,
      exercise_id: exerciseId,
      duration_seconds,
      rep_count: repParsed.value,
      cv_confidence_avg: confidenceParsed.value,
      notes,
    },
  ]);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/app/exercises/${exerciseId}`);
  revalidatePath("/app");
  return { ok: true, error: null };
}

/** Form / useActionState signature for the manual log form. */
export async function logExerciseSession(
  _prev: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  return insertExerciseSession(formData);
}

/**
 * Direct client await from PracticeCoach.
 * Separate export so it is not treated as a useActionState dispatch
 * (LogSessionForm on the same page binds logExerciseSession).
 */
export async function saveCameraPracticeSession(
  formData: FormData,
): Promise<SessionFormState> {
  return insertExerciseSession(formData);
}
