import Anthropic from "@anthropic-ai/sdk";

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
- Do not invent medical claims.`,
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
    system: `You write weekly wellness insights for Stasus, a vestibular symptom management wellness app.
Hard rules:
- Never diagnose, confirm conditions, or suggest medications/treatment plans.
- Pattern-level language only ("you logged more entries on…").
- Calm, non-punitive, no streak-shaming.
- If significance is low or data is sparse, say so gently and suggest continuing logging/practice.
- If the user should consider emergency care for stroke-like clusters, do NOT diagnose — remind them of emergency cues already in the app.
- Keep under 180 words.`,
    messages: [
      {
        role: "user",
        content: `Write the user-facing weekly insight for week_start=${payload.weekStart}.
Structured analysis JSON:
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

  return { text, model: SONNET_MODEL };
}

export function getAiModels() {
  return { haiku: HAIKU_MODEL, sonnet: SONNET_MODEL };
}
