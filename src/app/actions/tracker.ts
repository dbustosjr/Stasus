"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { evaluateRedFlag, RED_FLAG_SIGNALS } from "@/lib/ai/red-flag";
import { PRESET_TRIGGERS } from "@/lib/tracker/types";
import { recordActivityDay } from "@/app/actions/activity";
import { getAiModels, runDailyInsight } from "@/lib/ai/anthropic";
import {
  MAX_CUSTOM_TRIGGER_LENGTH,
  MAX_DURATION_MINUTES,
  MAX_SYMPTOM_NOTES_LENGTH,
  MAX_TRIGGERS_PER_LOG,
} from "@/lib/ai/limits";
import { checkAiCallBudget } from "@/lib/ai/rate-limit";
import { sanitizeUserText } from "@/lib/ai/sanitize";
import { createInsForgeAdminClient } from "@/lib/insforge/admin";
import {
  localDateString,
  normalizeTimeZone,
} from "@/lib/time/local-calendar";

export type TrackerFormState = {
  error: string | null;
};

const presetIds = new Set(PRESET_TRIGGERS.map((t) => t.id as string));
const redFlagIds = new Set(RED_FLAG_SIGNALS.map((s) => s.id as string));

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
    if (
      !Number.isFinite(duration_minutes) ||
      duration_minutes < 0 ||
      duration_minutes > MAX_DURATION_MINUTES
    ) {
      return {
        error: `Duration must be between 0 and ${MAX_DURATION_MINUTES} minutes.`,
      };
    }
  }

  const notesRaw = String(formData.get("notes") ?? "");
  const notes =
    sanitizeUserText(notesRaw, MAX_SYMPTOM_NOTES_LENGTH) || null;
  const selected = formData.getAll("triggers").map(String);
  const customNew = sanitizeUserText(
    String(formData.get("custom_trigger") ?? ""),
    MAX_CUSTOM_TRIGGER_LENGTH,
  );
  const redFlagSignals = formData
    .getAll("red_flag_signals")
    .map(String)
    .filter((id) => redFlagIds.has(id));

  const triggers: string[] = [];

  for (const value of selected) {
    if (presetIds.has(value)) {
      triggers.push(value);
      continue;
    }
    if (value.startsWith("custom:")) {
      const label = sanitizeUserText(
        value.slice("custom:".length),
        MAX_CUSTOM_TRIGGER_LENGTH,
      );
      if (label) triggers.push(label);
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
  ].slice(0, MAX_TRIGGERS_PER_LOG);

  const { data: inserted, error } = await insforge.database
    .from("symptom_logs")
    .insert([
      {
        user_id: user.id,
        severity,
        duration_minutes,
        triggers: uniqueTriggers,
        notes,
      },
    ])
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  const logId = inserted?.id ? String(inserted.id) : null;

  const redFlag = evaluateRedFlag(redFlagSignals);
  if (redFlag.triggered && redFlag.pattern) {
    await insforge.database.from("red_flag_events").insert([
      {
        user_id: user.id,
        symptom_log_id: logId,
        flagged_pattern: redFlag.pattern,
        signals: {
          matched: redFlag.matched,
          severity,
        },
      },
    ]);

    redirect("/emergency");
  }

  try {
    await recordActivityDay("symptom_log");
  } catch {
    // Activity stamp must not block the log.
  }

  if (logId && process.env.ANTHROPIC_API_KEY) {
    try {
      const admin = createInsForgeAdminClient();
      if (!admin) {
        // Soft-fail: need admin key to write AI rows after RLS tighten.
      } else {
        const budget = await checkAiCallBudget(insforge, user.id, 1);
        if (budget.ok) {
          const { data: profile } = await insforge.database
            .from("profiles")
            .select("timezone")
            .eq("id", user.id)
            .maybeSingle();
          const tz = normalizeTimeZone(
            profile && typeof profile === "object" && "timezone" in profile
              ? String((profile as { timezone?: string }).timezone)
              : "UTC",
          );
          const periodStart = localDateString(tz);
          const models = getAiModels();

          const insight = await runDailyInsight({
            log: {
              severity,
              duration_minutes,
              triggers: uniqueTriggers,
              notes,
            },
          });

          await admin.database.from("ai_call_log").insert([
            {
              user_id: user.id,
              purpose: "daily_insight",
              model_used: models.haiku,
            },
          ]);

          await admin.database.from("ai_insights").insert([
            {
              user_id: user.id,
              week_start: periodStart,
              period_start: periodStart,
              cadence: "daily",
              source_log_id: logId,
              insight_text: insight.text,
              model_used: insight.model,
              analysis_json: {
                severity,
                duration_minutes,
                triggers: uniqueTriggers,
              },
              generated_at: new Date().toISOString(),
            },
          ]);
        }
      }
    } catch {
      // Soft-fail: symptom log already saved.
    }
  }

  revalidatePath("/app/tracker");
  revalidatePath("/app/insights");
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
