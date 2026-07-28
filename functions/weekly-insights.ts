/**
 * InsForge Edge Function: weekly-insights
 * Invoked by Monday cron with Authorization: Bearer <CRON_SECRET>.
 * Batch-generates weekly wellness insights (Haiku → Sonnet) for eligible users.
 */
import { createAdminClient } from "npm:@insforge/sdk";

const BATCH_LIMIT = 40;
const HAIKU_MODEL =
  Deno.env.get("ANTHROPIC_HAIKU_MODEL") ?? "claude-haiku-4-5-20251001";
const SONNET_MODEL =
  Deno.env.get("ANTHROPIC_SONNET_MODEL") ?? "claude-sonnet-4-5";

type WeeklyAnalysis = {
  patterns: string[];
  significant: boolean;
  summary_points: string[];
  avoid: string[];
};

type SymptomLogRow = {
  id: string;
  severity: number | null;
  duration_minutes: number | null;
  triggers: unknown;
  notes: string | null;
  logged_at: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function startOfWeekUTC(d = new Date()): string {
  const date = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);
  return date.toISOString().slice(0, 10);
}

function requireCronAuth(req: Request): boolean {
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret) return false;
  const header = req.headers.get("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  return token.length > 0 && token === secret;
}

async function anthropicMessage(payload: {
  model: string;
  max_tokens: number;
  temperature: number;
  system: string;
  user: string;
}): Promise<string> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: payload.model,
      max_tokens: payload.max_tokens,
      temperature: payload.temperature,
      system: payload.system,
      messages: [{ role: "user", content: payload.user }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic ${res.status}: ${errText.slice(0, 400)}`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  return (data.content ?? [])
    .filter((b) => b.type === "text" && b.text)
    .map((b) => b.text!)
    .join("\n")
    .trim();
}

async function runHaikuAnalysis(payload: {
  weekStart: string;
  logs: SymptomLogRow[];
}): Promise<WeeklyAnalysis> {
  const text = await anthropicMessage({
    model: HAIKU_MODEL,
    max_tokens: 800,
    temperature: 0,
    system: `You are a structured analyst for a vestibular wellness app.
Return ONLY valid JSON with keys: patterns (string[]), significant (boolean), summary_points (string[]), avoid (string[]).
Rules:
- No diagnosis or condition confirmation.
- No medication or treatment-plan advice.
- Prefer conservative significance; if data is sparse, significant=false.
- Do not invent medical claims.`,
    user: `Week starting ${payload.weekStart}.
Exercise context: User may have practiced exercises; use symptom logs only.
Symptom logs JSON:
${JSON.stringify(payload.logs).slice(0, 12000)}`,
  });

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Haiku analysis did not return JSON.");
  const parsed = JSON.parse(jsonMatch[0]) as WeeklyAnalysis;
  return {
    patterns: Array.isArray(parsed.patterns) ? parsed.patterns : [],
    significant: Boolean(parsed.significant),
    summary_points: Array.isArray(parsed.summary_points)
      ? parsed.summary_points
      : [],
    avoid: Array.isArray(parsed.avoid) ? parsed.avoid : [],
  };
}

async function runSonnetInsight(payload: {
  weekStart: string;
  analysis: WeeklyAnalysis;
}): Promise<string> {
  const text = await anthropicMessage({
    model: SONNET_MODEL,
    max_tokens: 700,
    temperature: 0.4,
    system: `You write weekly wellness insights for Stasus, a vestibular symptom management wellness app.
Hard rules:
- Never diagnose, confirm conditions, or suggest medications/treatment plans.
- Pattern-level language only ("you logged more entries on…").
- Calm, non-punitive, no streak-shaming.
- If significance is low or data is sparse, say so gently and suggest continuing logging/practice.
- If the user should consider emergency care for stroke-like clusters, do NOT diagnose — remind them of emergency cues already in the app.
- Keep under 180 words.`,
    user: `Write the user-facing weekly insight for week_start=${payload.weekStart}.
Structured analysis JSON:
${JSON.stringify(payload.analysis)}`,
  });

  if (!text) throw new Error("Sonnet returned empty insight text.");
  return text;
}

export default async function (req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!requireCronAuth(req)) {
    return json({ error: "Unauthorized" }, 401);
  }

  if (!Deno.env.get("ANTHROPIC_API_KEY")) {
    return json({ error: "ANTHROPIC_API_KEY missing" }, 500);
  }

  const baseUrl = Deno.env.get("INSFORGE_BASE_URL");
  const apiKey = Deno.env.get("API_KEY");
  if (!baseUrl || !apiKey) {
    return json({ error: "InsForge admin env missing" }, 500);
  }

  const admin = createAdminClient({ baseUrl, apiKey });
  const weekStart = startOfWeekUTC();
  const weekStartDate = new Date(`${weekStart}T00:00:00.000Z`);
  const weekEnd = new Date(weekStartDate);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

  const { data: profiles, error: profilesError } = await admin.database
    .from("profiles")
    .select("id")
    .eq("onboarding_complete", true)
    .limit(500);

  if (profilesError) {
    return json({ error: profilesError.message }, 500);
  }

  const summary = {
    weekStart,
    processed: 0,
    skipped: 0,
    failed: 0,
    errors: [] as Array<{ userId: string; error: string }>,
  };

  for (const row of profiles ?? []) {
    if (summary.processed + summary.failed >= BATCH_LIMIT) break;

    const userId = String((row as { id: string }).id);

    try {
      const { data: existing } = await admin.database
        .from("ai_insights")
        .select("id")
        .eq("user_id", userId)
        .eq("week_start", weekStart)
        .maybeSingle();

      if (existing) {
        summary.skipped += 1;
        continue;
      }

      const { data: logs, error: logsError } = await admin.database
        .from("symptom_logs")
        .select("id, severity, duration_minutes, triggers, notes, logged_at")
        .eq("user_id", userId)
        .gte("logged_at", weekStartDate.toISOString())
        .lt("logged_at", weekEnd.toISOString())
        .order("logged_at", { ascending: true })
        .limit(200);

      if (logsError) throw new Error(logsError.message);

      const weekLogs = (logs ?? []) as SymptomLogRow[];
      if (weekLogs.length === 0) {
        summary.skipped += 1;
        continue;
      }

      await admin.database.from("ai_call_log").insert([
        {
          user_id: userId,
          purpose: "weekly_haiku_analysis",
          model_used: HAIKU_MODEL,
        },
      ]);

      const analysis = await runHaikuAnalysis({
        weekStart,
        logs: weekLogs,
      });

      await admin.database.from("ai_call_log").insert([
        {
          user_id: userId,
          purpose: "weekly_sonnet_insight",
          model_used: SONNET_MODEL,
        },
      ]);

      const insightText = await runSonnetInsight({ weekStart, analysis });

      const { error: upsertError } = await admin.database
        .from("ai_insights")
        .upsert(
          [
            {
              user_id: userId,
              week_start: weekStart,
              insight_text: insightText,
              model_used: SONNET_MODEL,
              analysis_json: analysis,
              generated_at: new Date().toISOString(),
            },
          ],
          { onConflict: "user_id,week_start" },
        );

      if (upsertError) {
        const { error: insertError } = await admin.database
          .from("ai_insights")
          .insert([
            {
              user_id: userId,
              week_start: weekStart,
              insight_text: insightText,
              model_used: SONNET_MODEL,
              analysis_json: analysis,
            },
          ]);
        if (insertError) throw new Error(insertError.message);
      }

      summary.processed += 1;
    } catch (err) {
      summary.failed += 1;
      summary.errors.push({
        userId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return json(summary);
}
