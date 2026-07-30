"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import {
  getAiModels,
  runHaikuAnalysis,
  runMonthlyInsight,
  runSonnetInsight,
} from "@/lib/ai/anthropic";
import { checkAiCallBudget } from "@/lib/ai/rate-limit";
import { createInsForgeAdminClient } from "@/lib/insforge/admin";
import {
  localMonthRangeUtcIso,
  localMonthStart,
  localWeekRangeUtcIso,
  localWeekStartMonday,
  normalizeTimeZone,
  previousLocalMonthStart,
} from "@/lib/time/local-calendar";

export type InsightActionState = {
  error: string | null;
  ok: boolean;
};

async function profileTimezone(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insforge: any,
  userId: string,
): Promise<string> {
  const { data } = await insforge.database
    .from("profiles")
    .select("timezone")
    .eq("id", userId)
    .maybeSingle();
  return normalizeTimeZone(
    data && typeof data === "object" && "timezone" in data
      ? String((data as { timezone?: string }).timezone ?? "UTC")
      : "UTC",
  );
}

async function upsertCadenceInsight(payload: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any;
  userId: string;
  cadence: "weekly" | "monthly";
  periodStart: string;
  insightText: string;
  modelUsed: string;
  analysisJson: unknown;
}) {
  const row = {
    user_id: payload.userId,
    week_start: payload.periodStart,
    period_start: payload.periodStart,
    cadence: payload.cadence,
    insight_text: payload.insightText,
    model_used: payload.modelUsed,
    analysis_json: payload.analysisJson,
    generated_at: new Date().toISOString(),
  };

  const { data: existing } = await payload.admin.database
    .from("ai_insights")
    .select("id")
    .eq("user_id", payload.userId)
    .eq("cadence", payload.cadence)
    .eq("period_start", payload.periodStart)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await payload.admin.database
      .from("ai_insights")
      .update({
        insight_text: row.insight_text,
        model_used: row.model_used,
        analysis_json: row.analysis_json,
        generated_at: row.generated_at,
        week_start: row.week_start,
      })
      .eq("id", existing.id);
    return error;
  }

  const { error } = await payload.admin.database
    .from("ai_insights")
    .insert([row]);
  return error;
}

export async function generateWeeklyInsight(
  _prev: InsightActionState,
  _formData: FormData,
): Promise<InsightActionState> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      ok: false,
      error:
        "ANTHROPIC_API_KEY is not configured on the server yet. Add it to .env.local to enable weekly insights.",
    };
  }

  const admin = createInsForgeAdminClient();
  if (!admin) {
    return {
      ok: false,
      error:
        "INSFORGE_API_KEY is required on the server to store AI notes securely.",
    };
  }

  const { insforge, user } = await requireUser();
  const budget = await checkAiCallBudget(insforge, user.id, 2);
  if (!budget.ok) {
    return { ok: false, error: budget.error };
  }

  const tz = await profileTimezone(insforge, user.id);
  const weekStart = localWeekStartMonday(tz);
  const { startIso, endIso } = localWeekRangeUtcIso(tz, weekStart);
  const models = getAiModels();

  const { data: logs, error: logsError } = await insforge.database
    .from("symptom_logs")
    .select("id, severity, duration_minutes, triggers, notes, logged_at")
    .eq("user_id", user.id)
    .gte("logged_at", startIso)
    .lt("logged_at", endIso)
    .order("logged_at", { ascending: true })
    .limit(200);

  if (logsError) {
    return { ok: false, error: logsError.message };
  }

  let analysis;
  try {
    analysis = await runHaikuAnalysis({
      weekStart,
      logs: logs ?? [],
      exerciseHint:
        "User may have practiced exercises or calm tools this week.",
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Haiku analysis failed.",
    };
  }

  let insight;
  try {
    insight = await runSonnetInsight({ weekStart, analysis });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Sonnet insight failed.",
    };
  }

  await admin.database.from("ai_call_log").insert([
    {
      user_id: user.id,
      purpose: "weekly_haiku_analysis",
      model_used: models.haiku,
    },
    {
      user_id: user.id,
      purpose: "weekly_sonnet_insight",
      model_used: models.sonnet,
    },
  ]);

  const upsertError = await upsertCadenceInsight({
    admin,
    userId: user.id,
    cadence: "weekly",
    periodStart: weekStart,
    insightText: insight.text,
    modelUsed: insight.model,
    analysisJson: analysis,
  });

  if (upsertError) {
    return { ok: false, error: upsertError.message };
  }

  revalidatePath("/app/insights");
  return { ok: true, error: null };
}

/** Lazy/manual monthly letter for the previous local month if missing. */
export async function ensureMonthlyInsight(): Promise<InsightActionState> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: null };
  }

  const admin = createInsForgeAdminClient();
  if (!admin) {
    return { ok: false, error: null };
  }

  const { insforge, user } = await requireUser();
  const tz = await profileTimezone(insforge, user.id);
  const monthStart = previousLocalMonthStart(tz);
  const currentMonth = localMonthStart(tz);
  const target =
    monthStart === currentMonth ? previousLocalMonthStart(tz) : monthStart;

  const { data: existing } = await insforge.database
    .from("ai_insights")
    .select("id")
    .eq("user_id", user.id)
    .eq("cadence", "monthly")
    .eq("period_start", target)
    .maybeSingle();

  if (existing?.id) {
    return { ok: true, error: null };
  }

  const budget = await checkAiCallBudget(insforge, user.id, 1);
  if (!budget.ok) {
    return { ok: false, error: budget.error };
  }

  const { startIso, endIso } = localMonthRangeUtcIso(tz, target);
  const { data: logs, error: logsError } = await insforge.database
    .from("symptom_logs")
    .select("id, severity, duration_minutes, triggers, notes, logged_at")
    .eq("user_id", user.id)
    .gte("logged_at", startIso)
    .lt("logged_at", endIso)
    .order("logged_at", { ascending: true })
    .limit(400);

  if (logsError) {
    return { ok: false, error: logsError.message };
  }

  if (!logs?.length) {
    return { ok: true, error: null };
  }

  const models = getAiModels();

  try {
    const insight = await runMonthlyInsight({
      monthStart: target,
      logs,
    });

    await admin.database.from("ai_call_log").insert([
      {
        user_id: user.id,
        purpose: "monthly_insight",
        model_used: models.sonnet,
      },
    ]);

    const err = await upsertCadenceInsight({
      admin,
      userId: user.id,
      cadence: "monthly",
      periodStart: target,
      insightText: insight.text,
      modelUsed: insight.model,
      analysisJson: { log_count: logs.length },
    });
    if (err) return { ok: false, error: err.message };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Monthly insight failed.",
    };
  }

  revalidatePath("/app/insights");
  return { ok: true, error: null };
}
