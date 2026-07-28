export type ParseResult =
  | { ok: true; value: number | null }
  | { ok: false; error: string };

/** Empty / omitted → null; otherwise integer ≥ 0. */
export function parseRepCount(raw: string): ParseResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: true, value: null };
  }

  const value = Number(trimmed);
  if (!Number.isInteger(value) || value < 0) {
    return { ok: false, error: "Rep count must be a whole number zero or more." };
  }

  return { ok: true, value };
}

/** Empty / omitted → null; otherwise number in [0, 1]. */
export function parseCvConfidenceAvg(raw: string): ParseResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: true, value: null };
  }

  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    return {
      ok: false,
      error: "Average confidence must be a number between 0 and 1.",
    };
  }

  return { ok: true, value };
}
