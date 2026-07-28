"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { PRESET_TRIGGERS } from "@/lib/tracker/types";

export type TrackerFormState = {
  error: string | null;
};

const presetIds = new Set(
  PRESET_TRIGGERS.map((t) => t.id as string),
);

export async function createSymptomLog(
  _prev: TrackerFormState,
  formData: FormData,
): Promise<TrackerFormState> {
  const { insforge, user } = await requireUser();

  const severityRaw = String(formData.get("severity") ?? "");
  const severity = Number.parseInt(severityRaw, 10);
  if (!Number.isFinite(severity) || severity < 1 || severity > 10) {
    return { error: "Severity must be a number from 1 to 10." };
  }

  const durationRaw = String(formData.get("duration_minutes") ?? "").trim();
  let duration_minutes: number | null = null;
  if (durationRaw) {
    duration_minutes = Number.parseInt(durationRaw, 10);
    if (!Number.isFinite(duration_minutes) || duration_minutes < 0) {
      return { error: "Duration must be zero or a positive number of minutes." };
    }
  }

  const notes = String(formData.get("notes") ?? "").trim() || null;
  const selected = formData.getAll("triggers").map(String);
  const customNew = String(formData.get("custom_trigger") ?? "").trim();

  const triggers: string[] = [];

  for (const value of selected) {
    if (presetIds.has(value)) {
      triggers.push(value);
      continue;
    }
    if (value.startsWith("custom:")) {
      triggers.push(value.slice("custom:".length));
    }
  }

  if (customNew) {
    const { data: existing } = await insforge.database
      .from("custom_triggers")
      .select("label")
      .eq("user_id", user.id)
      .ilike("label", customNew)
      .maybeSingle();

    if (existing?.label) {
      triggers.push(String(existing.label));
    } else {
      const { error: customError } = await insforge.database
        .from("custom_triggers")
        .insert([{ user_id: user.id, label: customNew }]);

      if (customError) {
        return { error: customError.message };
      }
      triggers.push(customNew);
    }
  }

  const uniqueTriggers = [
    ...new Set(triggers.map((t) => t.trim()).filter(Boolean)),
  ];

  const { error } = await insforge.database.from("symptom_logs").insert([
    {
      user_id: user.id,
      severity,
      duration_minutes,
      triggers: uniqueTriggers,
      notes,
    },
  ]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/tracker");
  redirect("/app/tracker");
}

export async function deleteSymptomLog(formData: FormData) {
  const { insforge, user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await insforge.database
    .from("symptom_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/app/tracker");
}
