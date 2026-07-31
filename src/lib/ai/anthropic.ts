import Anthropic from "@anthropic-ai/sdk";
import { withDisclaimer } from "@/lib/ai/disclaimer";
import {
  MODEL_LOGS_JSON_MAX_CHARS,
  MODEL_MONTHLY_LOGS_JSON_MAX_CHARS,
} from "@/lib/ai/limits";
import { polishInsightProse } from "@/lib/ai/polish-insight";
import {
  formatUntrustedLogPayload,
  sanitizeLogForModel,
  sanitizeLogsForModel,
  UNTRUSTED_DATA_RULE,
} from "@/lib/ai/sanitize";
import { STASUS_NOTE_VOICE } from "@/lib/ai/voice";

function finalizeInsightText(raw: string): string {
  return withDisclaimer(polishInsightProse(raw));
}

const HAIKU_MODEL =
  process.env.ANTHROPIC_HAIKU_MODEL ?? "claude-haiku-4-5-20251001";
const SONNET_MODEL = process.env.ANTHROPIC_SONNET_MODEL ?? "claude-sonnet-4-5";

function requireApiKey() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local (server-only).",
    );
  }
  return key;
}

export type WeeklyAnalysis = {
  patterns: string[];
  significant: boolean;
  summary_points: string[];
  avoid: string[];
};

export async function runHaikuAnalysis(payload: {
  weekStart: string;
  logs: unknown[];
  exerciseHint: string;
}): Promise<WeeklyAnalysis> {
  const client = new Anthropic({ apiKey: requireApiKey() });

  const safeLogs = sanitizeLogsForModel(
    payload.logs as Array<{
      severity: number;
      duration_minutes: number | null;
      triggers: unknown;
      notes: string | null;
      logged_at?: string;
    }>,
  );

  const response = await client.messages.create({
    model: HAIKU_MODEL,
    max_tokens: 800,
    temperature: 0,
    system: `You are a structured analyst for a vestibular wellness app.
Return ONLY valid JSON with keys: patterns (string[]), significant (boolean), summary_points (string[]), avoid (string[]).
Rules:
- No diagnosis or condition confirmation.
- No medication or treatment-plan advice.
- Prefer conservative significance; if data is sparse, significant=false.
- Do not invent medical claims.
- Write summary_points in plain human language (e.g. "sleep came up often", "a few tougher evenings mid-week") — not sterile analytics phrasing ("batch logging", "real-time tracking", "data points").
- ${UNTRUSTED_DATA_RULE}`,
    messages: [
      {
        role: "user",
        content: `Week starting ${payload.weekStart}.
Exercise context: ${payload.exerciseHint}
${formatUntrustedLogPayload("Symptom logs JSON", safeLogs, MODEL_LOGS_JSON_MAX_CHARS)}`,
      },
    ],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Haiku analysis did not return JSON.");
  }

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

export async function runSonnetInsight(payload: {
  weekStart: string;
  analysis: WeeklyAnalysis;
}): Promise<{ text: string; model: string }> {
  const client = new Anthropic({ apiKey: requireApiKey() });

  const response = await client.messages.create({
    model: SONNET_MODEL,
    max_tokens: 700,
    temperature: 0.4,
    system: `You write a short weekly note for Stasus, a vestibular wellness app.
${STASUS_NOTE_VOICE}
Cadence rules:
- Talk about the week gently ("a few tougher evenings", "sleep showed up often").
- Calm and non-punitive. Missed days are fine. If the week is sparse, say so kindly and keep it short.
- If emergency-adjacent clusters appear, do NOT diagnose. Briefly remind them the app has emergency cues.
- Keep under 160 words.
- ${UNTRUSTED_DATA_RULE}`,
    messages: [
      {
        role: "user",
        content: `Write the weekly note for the week starting ${payload.weekStart}.
Use this structured analysis only as quiet background (do not quote it mechanically):
${formatUntrustedLogPayload("Analysis JSON", payload.analysis, MODEL_LOGS_JSON_MAX_CHARS)}`,
      },
    ],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Sonnet returned empty insight text.");
  }

  return { text: finalizeInsightText(text), model: SONNET_MODEL };
}

export async function runDailyInsight(payload: {
  log: {
    severity: number;
    duration_minutes: number | null;
    triggers: string[];
    notes: string | null;
  };
}): Promise<{ text: string; model: string }> {
  const client = new Anthropic({ apiKey: requireApiKey() });

  const response = await client.messages.create({
    model: SONNET_MODEL,
    max_tokens: 450,
    temperature: 0.55,
    system: `You write a short daily note for Stasus after someone logs how they feel.
${STASUS_NOTE_VOICE}
Cadence rules:
- Sound like a sincere note left for one person, not a generated report.
- Reflect what they logged in ordinary words (how strong it felt, how long, what showed up). Do not recite the JSON fields.
- If you offer ideas, tuck one or two into the last paragraph as invitations, not instructions. Examples of tone: "If it feels doable later, a slower evening might help." Not: "Consider prioritizing rest and hydration."
- If severity is high, keep it brief and cautious. You may mention emergency cues in the app without diagnosing.
- Aim for about 80 to 120 words. Never use asterisks anywhere.
- ${UNTRUSTED_DATA_RULE}`,
    messages: [
      {
        role: "user",
        content: `Leave a short daily note for this person based on their log. Plain paragraphs only. No markdown.
${formatUntrustedLogPayload("Symptom log JSON", sanitizeLogForModel(payload.log))}`,
      },
    ],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Daily insight returned empty text.");
  }

  return { text: finalizeInsightText(text), model: SONNET_MODEL };
}

export async function runMonthlyInsight(payload: {
  monthStart: string;
  logs: unknown[];
}): Promise<{ text: string; model: string }> {
  const client = new Anthropic({ apiKey: requireApiKey() });

  const response = await client.messages.create({
    model: SONNET_MODEL,
    max_tokens: 800,
    temperature: 0.4,
    system: `You write a short monthly letter for Stasus, a vestibular wellness app.
${STASUS_NOTE_VOICE}
Cadence rules:
- Pattern-level over the month only. Gentle optional ideas welcome in prose.
- Calm and non-punitive. Sparse months are fine; keep those short.
- Keep under 200 words.
- ${UNTRUSTED_DATA_RULE}`,
    messages: [
      {
        role: "user",
        content: `Write the monthly note for the month starting ${payload.monthStart}.
${formatUntrustedLogPayload(
  "Symptom logs JSON (background only)",
  sanitizeLogsForModel(
    payload.logs as Array<{
      severity: number;
      duration_minutes: number | null;
      triggers: unknown;
      notes: string | null;
      logged_at?: string;
    }>,
  ),
  MODEL_MONTHLY_LOGS_JSON_MAX_CHARS,
)}`,
      },
    ],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Monthly insight returned empty text.");
  }

  return { text: finalizeInsightText(text), model: SONNET_MODEL };
}

export function getAiModels() {
  return { haiku: HAIKU_MODEL, sonnet: SONNET_MODEL };
}
