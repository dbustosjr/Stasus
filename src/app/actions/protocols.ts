"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import {
  defaultProtocolLabel,
  isExerciseCategory,
} from "@/lib/protocols/types";

export type ProtocolActionState = {
  error: string | null;
  ok?: boolean;
};

export async function startProtocol(
  _prev: ProtocolActionState,
  formData: FormData,
): Promise<ProtocolActionState> {
  const { insforge, user } = await requireUser();
  const category = String(formData.get("exercise_category") ?? "").trim();
  if (!isExerciseCategory(category)) {
    return { error: "Choose a practice category." };
  }

  const labelRaw = String(formData.get("protocol_label") ?? "").trim();
  const protocol_label = (labelRaw || defaultProtocolLabel(category)).slice(
    0,
    120,
  );

  const targetRaw = String(formData.get("adherence_target_per_week") ?? "").trim();
  let adherence_target_per_week: number | null = null;
  if (targetRaw) {
    const n = Number(targetRaw);
    if (!Number.isInteger(n) || n < 1 || n > 21) {
      return { error: "Sessions per week should be a whole number from 1 to 21." };
    }
    adherence_target_per_week = n;
  }

  const notesRaw = String(formData.get("notes") ?? "").trim();
  const notes = notesRaw ? notesRaw.slice(0, 500) : null;

  const { data: active } = await insforge.database
    .from("protocol_events")
    .select("id")
    .eq("user_id", user.id)
    .eq("exercise_category", category)
    .is("ended_at", null)
    .limit(1);

  if (active && active.length > 0) {
    return {
      error:
        "You already have an open protocol in this category. End it before starting another.",
    };
  }

  const { error } = await insforge.database.from("protocol_events").insert([
    {
      user_id: user.id,
      exercise_category: category,
      protocol_label,
      adherence_target_per_week,
      notes,
    },
  ]);

  if (error) return { error: error.message };

  revalidatePath("/app");
  revalidatePath("/app/exercises");
  revalidatePath("/app/insights");
  return { error: null, ok: true };
}

export async function endProtocol(
  _prev: ProtocolActionState,
  formData: FormData,
): Promise<ProtocolActionState> {
  const { insforge, user } = await requireUser();
  const id = String(formData.get("protocol_id") ?? "").trim();
  if (!id) return { error: "Missing protocol." };

  const { error } = await insforge.database
    .from("protocol_events")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("ended_at", null);

  if (error) return { error: error.message };

  revalidatePath("/app");
  revalidatePath("/app/exercises");
  revalidatePath("/app/insights");
  return { error: null, ok: true };
}
