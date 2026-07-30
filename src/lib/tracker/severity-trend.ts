import {
  localDateString,
  normalizeTimeZone,
} from "../time/local-calendar.ts";

export type TrendLog = {
  id: string;
  severity: number;
  triggers: string[];
  notes: string | null;
  logged_at: string;
};

export type TrendMode = "entries" | "days";

export type TrendPrefs = {
  mode: TrendMode;
  preset: number;
};

export type EntryTrendPoint = {
  kind: "entry";
  key: string;
  severity: number;
  logged_at: string;
  log: TrendLog;
};

export type DayTrendPoint = {
  kind: "day";
  key: string;
  date: string;
  severity: number;
  logs: TrendLog[];
};

export type TrendPoint = EntryTrendPoint | DayTrendPoint;

export const ENTRY_PRESETS = [7, 14, 30] as const;
export const DAY_PRESETS = [7, 30, 90] as const;
export const DEFAULT_TREND_PREFS: TrendPrefs = { mode: "entries", preset: 14 };
export const STORAGE_KEY = "stasus.severity-trend";

function middlePreset(mode: TrendMode): number {
  return mode === "entries" ? 14 : 30;
}

function isValidPreset(mode: TrendMode, preset: number): boolean {
  const list = mode === "entries" ? ENTRY_PRESETS : DAY_PRESETS;
  return (list as readonly number[]).includes(preset);
}

export function parseTrendPrefs(raw: string | null): TrendPrefs {
  if (!raw) return { ...DEFAULT_TREND_PREFS };
  try {
    const parsed = JSON.parse(raw) as Partial<TrendPrefs>;
    const mode: TrendMode =
      parsed.mode === "days" || parsed.mode === "entries"
        ? parsed.mode
        : DEFAULT_TREND_PREFS.mode;
    const presetNum = Number(parsed.preset);
    const preset = isValidPreset(mode, presetNum)
      ? presetNum
      : middlePreset(mode);
    return { mode, preset };
  } catch {
    return { ...DEFAULT_TREND_PREFS };
  }
}

export function prefsForModeSwitch(
  current: TrendPrefs,
  nextMode: TrendMode,
): TrendPrefs {
  if (current.mode === nextMode) return current;
  return {
    mode: nextMode,
    preset: isValidPreset(nextMode, current.preset)
      ? current.preset
      : middlePreset(nextMode),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function addLocalDays(localDate: string, days: number): string {
  const [y, m, d] = localDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

function sortLogsAsc(logs: TrendLog[]): TrendLog[] {
  return [...logs].sort(
    (a, b) =>
      new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime(),
  );
}

export function buildTrendPoints(
  logs: TrendLog[],
  opts: {
    mode: TrendMode;
    preset: number;
    timeZone?: string;
    now?: Date;
  },
): TrendPoint[] {
  const timeZone = normalizeTimeZone(opts.timeZone);
  const now = opts.now ?? new Date();
  const sorted = sortLogsAsc(logs);

  if (opts.mode === "entries") {
    const slice = sorted.slice(-opts.preset);
    return slice.map((log) => ({
      kind: "entry" as const,
      key: log.id,
      severity: log.severity,
      logged_at: log.logged_at,
      log,
    }));
  }

  const today = localDateString(timeZone, now);
  const startDate = addLocalDays(today, -(opts.preset - 1));
  const byDay = new Map<string, TrendLog[]>();

  for (const log of sorted) {
    const date = localDateString(timeZone, new Date(log.logged_at));
    if (date < startDate || date > today) continue;
    const list = byDay.get(date) ?? [];
    list.push(log);
    byDay.set(date, list);
  }

  const dates = [...byDay.keys()].sort();
  return dates.map((date) => {
    const dayLogs = byDay.get(date) ?? [];
    const sum = dayLogs.reduce((acc, l) => acc + l.severity, 0);
    const severity = dayLogs.length ? sum / dayLogs.length : 0;
    return {
      kind: "day" as const,
      key: date,
      date,
      severity,
      logs: dayLogs,
    };
  });
}

export function framingForPoints(points: TrendPoint[]): string {
  if (points.length < 2) {
    return "Log a few entries to see a gentle trend. Trends are informational, not a grade.";
  }
  const earliest = points[0]?.severity;
  const latest = points[points.length - 1]?.severity;
  if (earliest === undefined || latest === undefined) {
    return "Roughly steady across recent logs.";
  }
  const delta = latest - earliest;
  if (Math.abs(delta) < 1) {
    return "Roughly steady across recent logs.";
  }
  if (delta < 0) {
    return "Recent logs trend a bit lower than the start of this window.";
  }
  return "Recent logs trend a bit higher than the start of this window — information only, not failure.";
}

export function formatSeverity(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function truncateNotes(notes: string | null, max = 160): string | null {
  if (!notes) return null;
  const trimmed = notes.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}
