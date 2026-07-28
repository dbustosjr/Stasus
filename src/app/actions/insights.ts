"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import {
  getAiModels,
  runHaikuAnalysis,
  runSonnetInsight,
} from "@/lib/ai/anthropic";

export type InsightActionState = {
  error: string | null;
  ok: boolean;
};

function startOfWeekUTC(d = new Date()): string {
  const date = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const day = date.getUTCDay(); // 0 Sun
  const diff = day === 0 ? -6 : 1 - day; // Monday-start week
  date.setUTCDate(date.getUTCDate() + diff);
  return date.toISOString().slice(0, 10);
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

  const { insforge, user } = await requireUser();
  const weekStart = startOfWeekUTC();
  const models = getAiModels();

  const weekStartDate = new Date(`${weekStart}T00:00:00.000Z`);
  const weekEnd = new Date(weekStartDate);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

  const { data: logs, error: logsError } = await insforge.database
    .from("symptom_logs")
    .select("id, severity, duration_minutes, triggers, notes, logged_at")
    .eq("user_id", user.id)
    .gte("logged_at", weekStartDate.toISOString())
    .lt("logged_at", weekEnd.toISOString())
    .order("logged_at", { ascending: true })
    .limit(200);

  if (logsError) {
    return { ok: false, error: logsError.message };
  }

  await insforge.database.from("ai_call_log").insert([
    {
      user_id: user.id,
      purpose: "weekly_haiku_analysis",
      model_used: models.haiku,
    },
  ]);

  let analysis;
  try {
    analysis = await runHaikuAnalysis({
      weekStart,
      logs: logs ?? [],
      exerciseHint:
        "User may have used the exercise library; session tracking arrives later.",
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Haiku analysis failed.",
    };
  }

  await insforge.database.from("ai_call_log").insert([
    {
      user_id: user.id,
      purpose: "weekly_sonnet_insight",
      model_used: models.sonnet,
    },
  ]);

  let insight;
  try {
    insight = await runSonnetInsight({ weekStart, analysis });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Sonnet insight failed.",
    };
  }

  const { error: upsertError } = await insforge.database
    .from("ai_insights")
    .upsert(
      [
        {
          user_id: user.id,
          week_start: weekStart,
          insight_text: insight.text,
          model_used: insight.model,
          analysis_json: analysis,
          generated_at: new Date().toISOString(),
        },
      ],
      { onConflict: "user_id,week_start" },
    );

  if (upsertError) {
    // Fallback if upsert unsupported: try update then insert
    const { error: updateError } = await insforge.database
      .from("ai_insights")
      .update({
        insight_text: insight.text,
        model_used: insight.model,
        analysis_json: analysis,
        generated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("week_start", weekStart);

    if (updateError) {
      const { error: insertError } = await insforge.database
        .from("ai_insights")
        .insert([
          {
            user_id: user.id,
            week_start: weekStart,
            insight_text: insight.text,
            model_used: insight.model,
            analysis_json: analysis,
          },
        ]);
      if (insertError) {
        return { ok: false, error: insertError.message };
      }
    }
  }

  revalidatePath("/app/insights");
  return { ok: true, error: null };
}
