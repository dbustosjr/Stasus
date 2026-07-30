import { AI_CALLS_PER_USER_PER_DAY } from "./limits.ts";

export type AiBudgetResult =
  | { ok: true; used: number; remaining: number }
  | { ok: false; used: number; remaining: number; error: string };

function resolveCeiling(override?: number): number {
  if (
    typeof override === "number" &&
    Number.isFinite(override) &&
    override > 0
  ) {
    return Math.floor(override);
  }
  const fromEnv = Number(process.env.AI_CALLS_PER_USER_PER_DAY);
  if (Number.isFinite(fromEnv) && fromEnv > 0) return Math.floor(fromEnv);
  return AI_CALLS_PER_USER_PER_DAY;
}

/**
 * Check rolling 24h Anthropic budget via ai_call_log before calling the API.
 * `insforge` should be the authenticated user client (SELECT own rows).
 */
export async function checkAiCallBudget(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insforge: any,
  userId: string,
  neededCalls: number,
  ceiling?: number,
): Promise<AiBudgetResult> {
  const limit = resolveCeiling(ceiling);
  if (neededCalls < 1) {
    return { ok: true, used: 0, remaining: limit };
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await insforge.database
    .from("ai_call_log")
    .select("id")
    .eq("user_id", userId)
    .gte("called_at", since)
    .limit(limit + neededCalls + 5);

  if (error) {
    return {
      ok: false,
      used: limit,
      remaining: 0,
      error: "Could not verify AI rate limit. Try again shortly.",
    };
  }

  const used = Array.isArray(data) ? data.length : 0;
  const remaining = Math.max(0, limit - used);
  if (used + neededCalls > limit) {
    return {
      ok: false,
      used,
      remaining,
      error: `Daily AI limit reached (${limit} calls / 24h). Try again tomorrow.`,
    };
  }

  return { ok: true, used, remaining };
}
