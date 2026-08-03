"use server";

import { requireUser } from "@/lib/auth/require-user";
import { createInsForgeAdminClient } from "@/lib/insforge/admin";
import { computeOutcomeTrend } from "@/lib/insights/outcome-trends";
import type { ExerciseCategory } from "@/lib/exercises/types";

/**
 * Upsert 4- and 8-week outcome trends for the signed-in user (service role write).
 * Safe to call from Insights via `after()`.
 */
export async function ensureOutcomeTrends(): Promise<void> {
  const { insforge, user } = await requireUser();
  const admin = createInsForgeAdminClient();
  if (!admin) return;

  const { data: profile } = await insforge.database
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .maybeSingle();

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 70);

  const [{ data: sessions }, { data: logs }, { data: protocols }] =
    await Promise.all([
      insforge.database
        .from("exercise_sessions")
        .select("completed_at")
        .eq("user_id", user.id)
        .gte("completed_at", since.toISOString())
        .limit(500),
      insforge.database
        .from("symptom_logs")
        .select("severity, created_at, logged_at")
        .eq("user_id", user.id)
        .gte("created_at", since.toISOString())
        .limit(500),
      insforge.database
        .from("protocol_events")
        .select(
          "exercise_category, adherence_target_per_week, started_at, ended_at",
        )
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(20),
    ]);

  const sessionCompletedAt = (sessions ?? []).map((s) =>
    String((s as { completed_at: string }).completed_at),
  );

  const severityPoints = (logs ?? []).map((row) => {
    const r = row as {
      severity: number;
      created_at: string;
      logged_at?: string | null;
    };
    return {
      at: r.logged_at || r.created_at,
      severity: Number(r.severity),
    };
  });

  const activeProtocol = (protocols ?? []).find((p) => {
    const row = p as { ended_at: string | null };
    return row.ended_at == null;
  }) as
    | {
        exercise_category: ExerciseCategory;
        adherence_target_per_week: number | null;
      }
    | undefined;

  const target = activeProtocol?.adherence_target_per_week ?? null;

  for (const weeks of [4, 8] as const) {
    const result = computeOutcomeTrend({
      timezone: (profile as { timezone?: string } | null)?.timezone,
      sessionCompletedAt,
      severityPoints,
      adherenceTargetPerWeek: target,
      windowWeeks: weeks,
    });

    const payload = {
      user_id: user.id,
      window_start: result.windowStart,
      window_end: result.windowEnd,
      window_weeks: result.windowWeeks,
      adherence_rate: result.adherenceRate,
      severity_delta: result.severityDelta,
      significant: result.significant,
      model_used: result.modelUsed,
      summary_text: result.summaryText,
      generated_at: new Date().toISOString(),
    };

    const { data: existing } = await admin.database
      .from("outcome_trends")
      .select("id")
      .eq("user_id", user.id)
      .eq("window_weeks", weeks)
      .eq("window_end", result.windowEnd)
      .maybeSingle();

    if (existing?.id) {
      await admin.database
        .from("outcome_trends")
        .update(payload)
        .eq("id", existing.id);
    } else {
      await admin.database.from("outcome_trends").insert([payload]);
    }
  }
}
