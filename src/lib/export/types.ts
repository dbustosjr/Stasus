export const EXPORT_ROW_LIMIT = 5000;

export type ExportSymptomLog = {
  logged_at: string;
  severity: number;
  duration_minutes: number | null;
  triggers: string[];
  notes: string | null;
  archived: boolean;
};

export type ExportPracticeSession = {
  completed_at: string;
  exercise_title: string;
  duration_seconds: number | null;
  notes: string | null;
};

export type ExportPayload = {
  exported_at: string;
  email: string | null;
  /** IANA timezone used for display times */
  timezone: string;
  logs: ExportSymptomLog[];
  sessions: ExportPracticeSession[];
};

export function exportFilename(
  ext: "csv" | "pdf",
  when = new Date(),
  timeZone?: string | null,
): string {
  const tz = timeZone?.trim() || "UTC";
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(when);
    const bag: Record<string, string> = {};
    for (const p of parts) {
      if (p.type !== "literal") bag[p.type] = p.value;
    }
    return `stasus-export-${bag.year}-${bag.month}-${bag.day}.${ext}`;
  } catch {
    const y = when.getUTCFullYear();
    const m = String(when.getUTCMonth() + 1).padStart(2, "0");
    const d = String(when.getUTCDate()).padStart(2, "0");
    return `stasus-export-${y}-${m}-${d}.${ext}`;
  }
}
