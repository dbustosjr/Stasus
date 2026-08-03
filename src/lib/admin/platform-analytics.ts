import { CATEGORY_META, type ExerciseCategory } from "@/lib/exercises/types";
import { computePlatformUsage } from "@/lib/insights/usage";

export type DeidentifiedPlatformReport = {
  generatedAt: string;
  /** No user identifiers in this report. */
  deidentified: true;
  usage: {
    dau: number;
    wau: number;
    mau: number;
  };
  totals: {
    profileCount: number;
    symptomLogCount: number;
    symptomLogCount30d: number;
    exerciseSessionCount: number;
    exerciseSessionCount30d: number;
    insightCount: number;
    activeProtocolCount: number;
    protocolEventCount: number;
    researchConsentActiveCount: number;
    researchConsentPromptedCount: number;
  };
  sessionsByCategory: Array<{ category: string; label: string; count: number }>;
  insightsByCadence: Array<{ cadence: string; count: number }>;
  activitySourceDays: Array<{ source: string; dayCount: number }>;
  severity: {
    logCountWithSeverity: number;
    averageSeverity: number | null;
    averageSeverity30d: number | null;
  };
  protocolsByCategory: Array<{ category: string; label: string; count: number }>;
};

type ActivityRow = { user_id: string; activity_date: string; sources?: unknown };
type ProfileRow = { id: string; timezone?: string };
type SessionRow = {
  completed_at: string;
  exercise_id: string;
};
type ExerciseRow = { id: string; category: string };
type LogRow = { severity: number; created_at: string };
type InsightRow = { cadence: string };
type ProtocolRow = {
  exercise_category: string;
  ended_at: string | null;
};
type ConsentRow = {
  consented_at: string | null;
  revoked_at: string | null;
};

function daysAgoIso(days: number, now = new Date()): string {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

function avg(nums: number[]): number | null {
  if (!nums.length) return null;
  return Number(
    (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2),
  );
}

/**
 * Build a de-identified platform analytics report.
 * Callers must already authorize admin access. Never include email, user id,
 * notes, or condition labels in the returned object.
 */
export function buildDeidentifiedPlatformReport(input: {
  activity: ActivityRow[];
  profiles: ProfileRow[];
  sessions: SessionRow[];
  exercises: ExerciseRow[];
  logs: LogRow[];
  insights: InsightRow[];
  protocols: ProtocolRow[];
  consents: ConsentRow[];
  now?: Date;
}): DeidentifiedPlatformReport {
  const now = input.now ?? new Date();
  const since30 = daysAgoIso(30, now);

  const timezones: Record<string, string> = {};
  for (const p of input.profiles) {
    timezones[String(p.id)] = p.timezone || "UTC";
  }

  const usage = computePlatformUsage(
    input.activity.map((r) => ({
      user_id: String(r.user_id),
      activity_date: String(r.activity_date),
    })),
    timezones,
    now,
  );

  const exerciseCategory = new Map(
    input.exercises.map((e) => [String(e.id), String(e.category)]),
  );

  const sessionsByCategoryCount = new Map<string, number>();
  let sessions30 = 0;
  for (const s of input.sessions) {
    const cat = exerciseCategory.get(String(s.exercise_id)) ?? "unknown";
    sessionsByCategoryCount.set(cat, (sessionsByCategoryCount.get(cat) ?? 0) + 1);
    if (s.completed_at >= since30) sessions30 += 1;
  }

  const sessionsByCategory = [...sessionsByCategoryCount.entries()]
    .map(([category, count]) => ({
      category,
      label:
        category in CATEGORY_META
          ? CATEGORY_META[category as ExerciseCategory].label
          : category,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const cadenceCount = new Map<string, number>();
  for (const i of input.insights) {
    const c = i.cadence || "weekly";
    cadenceCount.set(c, (cadenceCount.get(c) ?? 0) + 1);
  }
  const insightsByCadence = [...cadenceCount.entries()]
    .map(([cadence, count]) => ({ cadence, count }))
    .sort((a, b) => b.count - a.count);

  const sourceDays = new Map<string, number>();
  for (const row of input.activity) {
    const sources =
      row.sources && typeof row.sources === "object"
        ? (row.sources as Record<string, unknown>)
        : {};
    for (const key of Object.keys(sources)) {
      if (sources[key]) {
        sourceDays.set(key, (sourceDays.get(key) ?? 0) + 1);
      }
    }
  }
  const activitySourceDays = [...sourceDays.entries()]
    .map(([source, dayCount]) => ({ source, dayCount }))
    .sort((a, b) => b.dayCount - a.dayCount);

  const severities = input.logs.map((l) => Number(l.severity)).filter((n) =>
    Number.isFinite(n),
  );
  const severities30 = input.logs
    .filter((l) => l.created_at >= since30)
    .map((l) => Number(l.severity))
    .filter((n) => Number.isFinite(n));

  const logs30 = input.logs.filter((l) => l.created_at >= since30).length;

  const protocolCategoryCount = new Map<string, number>();
  let activeProtocols = 0;
  for (const p of input.protocols) {
    protocolCategoryCount.set(
      p.exercise_category,
      (protocolCategoryCount.get(p.exercise_category) ?? 0) + 1,
    );
    if (p.ended_at == null) activeProtocols += 1;
  }
  const protocolsByCategory = [...protocolCategoryCount.entries()]
    .map(([category, count]) => ({
      category,
      label:
        category in CATEGORY_META
          ? CATEGORY_META[category as ExerciseCategory].label
          : category,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const researchConsentActiveCount = input.consents.filter(
    (c) => c.consented_at && !c.revoked_at,
  ).length;

  return {
    generatedAt: now.toISOString(),
    deidentified: true,
    usage,
    totals: {
      profileCount: input.profiles.length,
      symptomLogCount: input.logs.length,
      symptomLogCount30d: logs30,
      exerciseSessionCount: input.sessions.length,
      exerciseSessionCount30d: sessions30,
      insightCount: input.insights.length,
      activeProtocolCount: activeProtocols,
      protocolEventCount: input.protocols.length,
      researchConsentActiveCount,
      researchConsentPromptedCount: input.consents.length,
    },
    sessionsByCategory,
    insightsByCadence,
    activitySourceDays,
    severity: {
      logCountWithSeverity: severities.length,
      averageSeverity: avg(severities),
      averageSeverity30d: avg(severities30),
    },
    protocolsByCategory,
  };
}

export function deidentifiedReportToCsv(report: DeidentifiedPlatformReport): string {
  const lines: string[] = [];
  const push = (section: string, key: string, value: string | number | null) => {
    lines.push(
      [section, key, value == null ? "" : String(value)]
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(","),
    );
  };

  lines.push("section,metric,value");
  push("meta", "generated_at", report.generatedAt);
  push("meta", "deidentified", "true");
  push("usage", "dau", report.usage.dau);
  push("usage", "wau", report.usage.wau);
  push("usage", "mau", report.usage.mau);

  for (const [k, v] of Object.entries(report.totals)) {
    push("totals", k, v);
  }
  push("severity", "average", report.severity.averageSeverity);
  push("severity", "average_30d", report.severity.averageSeverity30d);
  push("severity", "log_count", report.severity.logCountWithSeverity);

  for (const row of report.sessionsByCategory) {
    push("sessions_by_category", row.label, row.count);
  }
  for (const row of report.insightsByCadence) {
    push("insights_by_cadence", row.cadence, row.count);
  }
  for (const row of report.activitySourceDays) {
    push("activity_sources", row.source, row.dayCount);
  }
  for (const row of report.protocolsByCategory) {
    push("protocols_by_category", row.label, row.count);
  }

  return `${lines.join("\n")}\n`;
}

export function deidentifiedReportToText(
  report: DeidentifiedPlatformReport,
): string {
  const lines = [
    "Stasus platform report (de-identified)",
    `Generated: ${report.generatedAt}`,
    "",
    "Usage (local calendar)",
    `DAU ${report.usage.dau} · WAU ${report.usage.wau} · MAU ${report.usage.mau}`,
    "",
    "Totals",
    `Profiles: ${report.totals.profileCount}`,
    `Symptom logs: ${report.totals.symptomLogCount} (${report.totals.symptomLogCount30d} in last 30 days)`,
    `Exercise sessions: ${report.totals.exerciseSessionCount} (${report.totals.exerciseSessionCount30d} in last 30 days)`,
    `Insights generated: ${report.totals.insightCount}`,
    `Protocol events: ${report.totals.protocolEventCount} (${report.totals.activeProtocolCount} active)`,
    `Research consent active: ${report.totals.researchConsentActiveCount} (prompted records: ${report.totals.researchConsentPromptedCount})`,
    "",
    "Average severity",
    `All-time: ${report.severity.averageSeverity ?? "n/a"} · 30d: ${report.severity.averageSeverity30d ?? "n/a"}`,
    "",
    "Sessions by category",
    ...report.sessionsByCategory.map((r) => `${r.label}: ${r.count}`),
    "",
    "Insights by cadence",
    ...report.insightsByCadence.map((r) => `${r.cadence}: ${r.count}`),
    "",
    "Activity source days",
    ...report.activitySourceDays.map((r) => `${r.source}: ${r.dayCount}`),
    "",
    "This report contains no user emails, names, IDs, notes, or condition labels.",
  ];
  return lines.join("\n");
}
