import {
  localDateString,
  localMonthStart,
  localWeekStartMonday,
  normalizeTimeZone,
} from "@/lib/time/local-calendar";

export type PersonalUsage = {
  timezone: string;
  activeToday: boolean;
  daysThisWeek: number;
  daysThisMonth: number;
  today: string;
  weekStart: string;
  monthStart: string;
};

export function computePersonalUsage(
  timezone: string | null | undefined,
  activityDates: string[],
  now: Date = new Date(),
): PersonalUsage {
  const tz = normalizeTimeZone(timezone);
  const today = localDateString(tz, now);
  const weekStart = localWeekStartMonday(tz, now);
  const monthStart = localMonthStart(tz, now);
  const set = new Set(activityDates);

  let daysThisWeek = 0;
  let daysThisMonth = 0;
  for (const d of set) {
    if (d >= weekStart && d <= today) daysThisWeek += 1;
    if (d >= monthStart && d <= today) daysThisMonth += 1;
  }

  return {
    timezone: tz,
    activeToday: set.has(today),
    daysThisWeek,
    daysThisMonth,
    today,
    weekStart,
    monthStart,
  };
}

export type PlatformUsage = {
  dau: number;
  wau: number;
  mau: number;
};

/**
 * Platform DAU/WAU/MAU using each user's local calendar.
 * `rows` are activity days; `timezones` map userId → IANA tz.
 */
export function computePlatformUsage(
  rows: Array<{ user_id: string; activity_date: string }>,
  timezones: Record<string, string>,
  now: Date = new Date(),
): PlatformUsage {
  const dau = new Set<string>();
  const wau = new Set<string>();
  const mau = new Set<string>();

  for (const row of rows) {
    const tz = normalizeTimeZone(timezones[row.user_id] ?? "UTC");
    const today = localDateString(tz, now);
    const weekStart = localWeekStartMonday(tz, now);
    const monthStart = localMonthStart(tz, now);
    const d = row.activity_date;

    if (d === today) dau.add(row.user_id);
    if (d >= weekStart && d <= today) wau.add(row.user_id);
    if (d >= monthStart && d <= today) mau.add(row.user_id);
  }

  return { dau: dau.size, wau: wau.size, mau: mau.size };
}
