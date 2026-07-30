"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import {
  MAX_SESSION_DURATION_SECONDS,
  MAX_SESSION_NOTES_LENGTH,
} from "@/lib/ai/limits";
import { sanitizeUserText } from "@/lib/ai/sanitize";
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

  // Manual form: minutes + seconds (0–59). Camera coach may still send total seconds only.
  const minutesRaw = String(formData.get("duration_minutes") ?? "").trim();
  const secondsRaw = String(formData.get("duration_seconds") ?? "").trim();
  let duration_seconds: number | null = null;

  if (minutesRaw || secondsRaw) {
    const minutes = minutesRaw ? Number.parseInt(minutesRaw, 10) : 0;
    const seconds = secondsRaw ? Number.parseInt(secondsRaw, 10) : 0;
    const hasMinutesField = Boolean(minutesRaw);
    // Camera path only posts duration_seconds as a total (can be > 59).
    // Manual path posts duration_minutes and/or duration_seconds (0–59).
    if (!hasMinutesField && secondsRaw && seconds > 59) {
      duration_seconds = seconds;
    } else {
      if (
        !Number.isFinite(minutes) ||
        minutes < 0 ||
        !Number.isFinite(seconds) ||
        seconds < 0 ||
        (hasMinutesField && seconds > 59)
      ) {
        return {
          ok: false,
          error:
            "Enter minutes as 0 or more, and seconds from 0–59 (or leave blank).",
        };
      }
      duration_seconds = minutes * 60 + seconds;
    }

    if (
      duration_seconds === null ||
      !Number.isFinite(duration_seconds) ||
      duration_seconds < 0 ||
      duration_seconds > MAX_SESSION_DURATION_SECONDS
    ) {
      return {
        ok: false,
        error: `Duration must be between 0 and ${Math.floor(MAX_SESSION_DURATION_SECONDS / 60)} minutes.`,
      };
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

  const notes =
    sanitizeUserText(String(formData.get("notes") ?? ""), MAX_SESSION_NOTES_LENGTH) ||
    null;

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

  try {
    const { recordActivityDay } = await import("@/app/actions/activity");
    await recordActivityDay("exercise");
  } catch {
    // ignore
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
