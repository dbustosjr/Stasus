import { normalizeTimeZone } from "../time/local-calendar.ts";

/** Human-readable local date + time, e.g. "Jul 30, 2026 at 2:31 AM PDT". */
export function formatExportDateTime(
  iso: string,
  timeZone: string | null | undefined,
): string {
  const tz = normalizeTimeZone(timeZone);
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso || "";

  try {
    const datePart = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
    const timePart = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date);
    return `${datePart} at ${timePart}`;
  } catch {
    return date.toLocaleString("en-US");
  }
}

/** e.g. "15 sec", "1 min", "1 min 30 sec". */
export function formatExportDurationSeconds(
  seconds: number | null | undefined,
): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return "";
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m === 0) return `${s} sec`;
  if (s === 0) return `${m} min`;
  return `${m} min ${s} sec`;
}

export function formatExportDurationMinutes(
  minutes: number | null | undefined,
): string {
  if (minutes == null || !Number.isFinite(minutes) || minutes < 0) return "";
  return `${minutes} min`;
}
