"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";

export type SessionFormState = {
  error: string | null;
  ok: boolean;
};

export async function logExerciseSession(
  _prev: SessionFormState,
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

  const notes = String(formData.get("notes") ?? "").trim() || null;

  const { error } = await insforge.database.from("exercise_sessions").insert([
    {
      user_id: user.id,
      exercise_id: exerciseId,
      duration_seconds,
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
