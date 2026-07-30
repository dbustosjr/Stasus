import type { ExportPayload } from "./types.ts";
import {
  formatExportDateTime,
  formatExportDurationMinutes,
  formatExportDurationSeconds,
} from "./format.ts";

/** Escape one CSV field (RFC-style quoting). */
export function csvField(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  const raw = String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export function buildExportCsv(payload: ExportPayload): string {
  const tz = payload.timezone;
  const lines: string[] = [];
  lines.push("# Stasus export");
  lines.push(`# Exported,${csvField(formatExportDateTime(payload.exported_at, tz))}`);
  lines.push(`# Time zone,${csvField(tz)}`);
  if (payload.email) {
    lines.push(`# Account,${csvField(payload.email)}`);
  }
  lines.push(
    "# Includes archived symptom entries. Practice sessions and symptom logs only.",
  );
  lines.push("");

  lines.push("# Symptom logs");
  lines.push(
    [
      "date_time",
      "severity",
      "duration",
      "triggers",
      "notes",
      "archived",
    ].join(","),
  );
  for (const log of payload.logs) {
    lines.push(
      [
        csvField(formatExportDateTime(log.logged_at, tz)),
        csvField(`${log.severity}/10`),
        csvField(formatExportDurationMinutes(log.duration_minutes)),
        csvField(log.triggers.join("; ")),
        csvField(log.notes),
        csvField(log.archived ? "yes" : "no"),
      ].join(","),
    );
  }

  lines.push("");
  lines.push("# Practice sessions");
  lines.push(["date_time", "exercise", "duration", "notes"].join(","));
  for (const session of payload.sessions) {
    lines.push(
      [
        csvField(formatExportDateTime(session.completed_at, tz)),
        csvField(session.exercise_title),
        csvField(formatExportDurationSeconds(session.duration_seconds)),
        csvField(session.notes),
      ].join(","),
    );
  }

  lines.push("");
  return lines.join("\n");
}
