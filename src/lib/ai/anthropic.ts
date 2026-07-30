import Anthropic from "@anthropic-ai/sdk";
import { withDisclaimer } from "@/lib/ai/disclaimer";

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
- Write summary_points in plain human language (e.g. "sleep came up often", "a few tougher evenings mid-week") — not sterile analytics phrasing ("batch logging", "real-time tracking", "data points").`,
    messages: [
      {
        role: "user",
        content: `Week starting ${payload.weekStart}.
Exercise context: ${payload.exerciseHint}
Symptom logs JSON:
${JSON.stringify(payload.logs).slice(0, 12000)}`,
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
Voice: warm, plainspoken, human — like a thoughtful clinician friend, not a dashboard or analyst report.
Hard rules:
- Never diagnose, confirm conditions, or suggest medications/treatment plans.
- Talk about patterns gently ("a few days clustered…", "sleep showed up often…") — avoid sterile phrases like "batch logging", "real-time tracking", "data points", "entries in quick succession", or "significance".
- Do not invent section headers like "What showed up:" unless the user would naturally write that way; prefer flowing paragraphs.
- Calm and non-punitive. Missed days are fine.
- If the week is sparse, say so kindly and keep it short.
- If emergency-adjacent clusters appear, do NOT diagnose — briefly remind them the app has emergency cues.
- Do not write a medical disclaimer footer; the app adds one separately.
- Keep under 160 words. No emojis. No model/meta commentary.`,
    messages: [
      {
        role: "user",
        content: `Write the weekly note for the week starting ${payload.weekStart}.
Use this structured analysis only as quiet background (do not quote it mechanically):
${JSON.stringify(payload.analysis)}`,
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

  return { text: withDisclaimer(text), model: SONNET_MODEL };
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
    model: HAIKU_MODEL,
    max_tokens: 500,
    temperature: 0.4,
    system: `You write a short daily note for Stasus after someone logs vestibular-related symptoms.
Voice: warm, plainspoken, human — a supportive wellness companion, not a clinician chart.
Hard rules:
- Never diagnose, confirm conditions, or suggest medications/treatment plans.
- Ground the note in what they logged (severity, duration, triggers, notes).
- Include 2–4 gentle, practical suggestions that might ease or slightly improve how things feel today (pace, rest, reduce a trigger if safe, try in-app calm tools or mapped exercises at a comfortable intensity). Frame as optional ideas, not orders.
- If severity is high, prioritize rest and caution; remind them emergency cues exist in the app without diagnosing.
- Keep under 140 words. Flowing paragraphs. No emojis. No model/meta commentary.
- Do not write a medical disclaimer footer; the app adds one separately.`,
    messages: [
      {
        role: "user",
        content: `Write the daily note and suggestions for this log:
${JSON.stringify(payload.log)}`,
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

  return { text: withDisclaimer(text), model: HAIKU_MODEL };
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
Voice: warm, plainspoken, human — reflective, not analytical jargon.
Hard rules:
- Never diagnose, confirm conditions, or suggest medications/treatment plans.
- Pattern-level over the month only. Gentle suggestions welcome.
- Calm and non-punitive. Sparse months are fine — keep it short.
- Do not write a medical disclaimer footer; the app adds one separately.
- Keep under 200 words. No emojis. No model/meta commentary.`,
    messages: [
      {
        role: "user",
        content: `Write the monthly note for the month starting ${payload.monthStart}.
Symptom logs JSON (background only):
${JSON.stringify(payload.logs).slice(0, 14000)}`,
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

  return { text: withDisclaimer(text), model: SONNET_MODEL };
}

export function getAiModels() {
  return { haiku: HAIKU_MODEL, sonnet: SONNET_MODEL };
}
