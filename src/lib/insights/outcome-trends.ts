import { localDateString, normalizeTimeZone } from "@/lib/time/local-calendar";

export type OutcomeTrendInput = {
  timezone: string | null | undefined;
  /** ISO timestamps of completed exercise sessions in the window. */
  sessionCompletedAt: string[];
  /** Symptom severities with ISO created/logged times. */
  severityPoints: Array<{ at: string; severity: number }>;
  /** Target sessions/week from active or overlapping protocol; null if none. */
  adherenceTargetPerWeek: number | null;
  windowWeeks: 4 | 8;
  now?: Date;
};

export type OutcomeTrendResult = {
  windowStart: string;
  windowEnd: string;
  windowWeeks: 4 | 8;
  adherenceRate: number | null;
  severityDelta: number | null;
  significant: boolean;
  summaryText: string;
  modelUsed: "deterministic";
};

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function mean(nums: number[]): number | null {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/**
 * Deterministic 4/8-week adherence vs severity delta for one user.
 * Adherence = sessions / (target_per_week * weeks), capped at 1.
 * Severity delta = mean(second half) - mean(first half); negative = improvement.
 */
export function computeOutcomeTrend(input: OutcomeTrendInput): OutcomeTrendResult {
  const now = input.now ?? new Date();
  const tz = normalizeTimeZone(input.timezone);
  const windowEnd = localDateString(tz, now);
  const windowStart = addDays(windowEnd, -(input.windowWeeks * 7 - 1));

  const sessionsInWindow = input.sessionCompletedAt.filter((iso) => {
    const d = localDateString(tz, new Date(iso));
    return d >= windowStart && d <= windowEnd;
  });

  const target = input.adherenceTargetPerWeek;
  const expected =
    target && target > 0 ? target * input.windowWeeks : null;
  const adherenceRate =
    expected != null
      ? Math.min(1, sessionsInWindow.length / expected)
      : sessionsInWindow.length > 0
        ? null
        : null;

  const points = input.severityPoints
    .map((p) => ({
      day: localDateString(tz, new Date(p.at)),
      severity: p.severity,
    }))
    .filter((p) => p.day >= windowStart && p.day <= windowEnd)
    .sort((a, b) => a.day.localeCompare(b.day));

  const mid = addDays(windowStart, Math.floor((input.windowWeeks * 7) / 2));
  const first = points.filter((p) => p.day < mid).map((p) => p.severity);
  const second = points.filter((p) => p.day >= mid).map((p) => p.severity);
  const m1 = mean(first);
  const m2 = mean(second);
  const severityDelta =
    m1 != null && m2 != null ? Number((m2 - m1).toFixed(2)) : null;

  const enoughLogs = first.length >= 2 && second.length >= 2;
  const enoughPractice = sessionsInWindow.length >= Math.max(2, input.windowWeeks);
  const deltaStrong =
    severityDelta != null && Math.abs(severityDelta) >= 1.0;
  const significant = enoughLogs && enoughPractice && deltaStrong;

  let summaryText: string;
  if (severityDelta == null) {
    summaryText =
      "Not enough symptom logs in this window yet to compare the first half with the second.";
  } else if (severityDelta <= -1) {
    summaryText = `Over ${input.windowWeeks} weeks, average severity was about ${Math.abs(severityDelta).toFixed(1)} points lower in the second half than the first.`;
  } else if (severityDelta >= 1) {
    summaryText = `Over ${input.windowWeeks} weeks, average severity was about ${severityDelta.toFixed(1)} points higher in the second half than the first.`;
  } else {
    summaryText = `Over ${input.windowWeeks} weeks, average severity stayed about the same between the first and second half.`;
  }

  if (adherenceRate != null) {
    summaryText += ` Practice adherence versus your target was about ${Math.round(adherenceRate * 100)}%.`;
  } else if (sessionsInWindow.length > 0) {
    summaryText += ` You logged ${sessionsInWindow.length} practice session${sessionsInWindow.length === 1 ? "" : "s"} in this window.`;
  }

  summaryText +=
    " This is a wellness pattern note, not a clinical outcome or proof that practice caused the change.";

  return {
    windowStart,
    windowEnd,
    windowWeeks: input.windowWeeks,
    adherenceRate:
      adherenceRate != null ? Number(adherenceRate.toFixed(3)) : null,
    severityDelta,
    significant,
    summaryText,
    modelUsed: "deterministic",
  };
}
