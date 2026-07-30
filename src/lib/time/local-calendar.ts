/**
 * Local-calendar helpers using IANA time zones (e.g. America/Los_Angeles).
 * All returned dates are YYYY-MM-DD strings in that zone.
 */

function partsInZone(timeZone: string, instant: Date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  const bag: Record<string, string> = {};
  for (const p of fmt.formatToParts(instant)) {
    if (p.type !== "literal") bag[p.type] = p.value;
  }
  return {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    weekday: bag.weekday, // Sun Mon Tue...
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function normalizeTimeZone(tz: string | null | undefined): string {
  const t = (tz ?? "").trim();
  if (!t) return "UTC";
  try {
    // Throws RangeError for invalid zones in modern engines
    Intl.DateTimeFormat(undefined, { timeZone: t });
    return t;
  } catch {
    return "UTC";
  }
}

export function localDateString(
  timeZone: string,
  instant: Date = new Date(),
): string {
  const tz = normalizeTimeZone(timeZone);
  const { year, month, day } = partsInZone(tz, instant);
  return `${year}-${pad(month)}-${pad(day)}`;
}

const WEEKDAY_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** Monday-start week: return local YYYY-MM-DD of that Monday. */
export function localWeekStartMonday(
  timeZone: string,
  instant: Date = new Date(),
): string {
  const tz = normalizeTimeZone(timeZone);
  const { year, month, day, weekday } = partsInZone(tz, instant);
  const dow = WEEKDAY_TO_INDEX[weekday] ?? 0;
  const diff = dow === 0 ? -6 : 1 - dow;

  // Build a UTC noon anchor for the local Y-M-D, then shift by diff days
  const anchor = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  anchor.setUTCDate(anchor.getUTCDate() + diff);
  return localDateString(tz, anchor);
}

export function localMonthStart(
  timeZone: string,
  instant: Date = new Date(),
): string {
  const tz = normalizeTimeZone(timeZone);
  const { year, month } = partsInZone(tz, instant);
  return `${year}-${pad(month)}-01`;
}

/** Exclusive end instant for a local calendar date (start of next local day as UTC ISO). */
export function localDayRangeUtcIso(
  timeZone: string,
  localDate: string,
): { startIso: string; endIso: string } {
  const tz = normalizeTimeZone(timeZone);
  const start = zonedLocalToUtc(tz, localDate, 0, 0, 0);
  const end = zonedLocalToUtc(tz, addLocalDays(localDate, 1), 0, 0, 0);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

/**
 * Approximate: interpret Y-M-D H:M:S as wall time in `timeZone`, return UTC Date.
 * Uses binary search against Intl formatting (no deps).
 */
export function zonedLocalToUtc(
  timeZone: string,
  localDate: string,
  hour: number,
  minute: number,
  second: number,
): Date {
  const tz = normalizeTimeZone(timeZone);
  const [y, m, d] = localDate.split("-").map(Number);
  // Guess UTC as if the wall time were UTC, then correct
  let guess = Date.UTC(y, m - 1, d, hour, minute, second);
  for (let i = 0; i < 4; i++) {
    const asLocal = partsInZone(tz, new Date(guess));
    const localAsUtc = Date.UTC(
      asLocal.year,
      asLocal.month - 1,
      asLocal.day,
      hour,
      minute,
      second,
    );
    // Desired wall components vs what guess shows — adjust by difference of "UTC noon encoding"
    const desired = Date.UTC(y, m - 1, d, hour, minute, second);
    const shown = Date.UTC(
      asLocal.year,
      asLocal.month - 1,
      asLocal.day,
      // re-read hour from formatter
      Number(
        new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          hour: "2-digit",
          hourCycle: "h23",
          minute: "2-digit",
          second: "2-digit",
        })
          .formatToParts(new Date(guess))
          .find((p) => p.type === "hour")?.value ?? hour,
      ),
      Number(
        new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          minute: "2-digit",
        })
          .formatToParts(new Date(guess))
          .find((p) => p.type === "minute")?.value ?? minute,
      ),
      Number(
        new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          second: "2-digit",
        })
          .formatToParts(new Date(guess))
          .find((p) => p.type === "second")?.value ?? second,
      ),
    );
    void localAsUtc;
    const delta = desired - shown;
    if (delta === 0) break;
    guess += delta;
  }
  return new Date(guess);
}

/** Range [start, end) in UTC ISO covering local Monday week. */
export function localWeekRangeUtcIso(
  timeZone: string,
  weekStartLocal: string,
): { startIso: string; endIso: string } {
  const tz = normalizeTimeZone(timeZone);
  const start = zonedLocalToUtc(tz, weekStartLocal, 0, 0, 0);
  const end = zonedLocalToUtc(tz, addLocalDays(weekStartLocal, 7), 0, 0, 0);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

export function localMonthRangeUtcIso(
  timeZone: string,
  monthStartLocal: string,
): { startIso: string; endIso: string } {
  const tz = normalizeTimeZone(timeZone);
  const start = zonedLocalToUtc(tz, monthStartLocal, 0, 0, 0);
  const [y, m] = monthStartLocal.split("-").map(Number);
  const nextMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${pad(m + 1)}-01`;
  const end = zonedLocalToUtc(tz, nextMonth, 0, 0, 0);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

function addLocalDays(localDate: string, days: number): string {
  const [y, m, d] = localDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

export function previousLocalMonthStart(
  timeZone: string,
  instant: Date = new Date(),
): string {
  const current = localMonthStart(timeZone, instant);
  const [y, m] = current.split("-").map(Number);
  if (m === 1) return `${y - 1}-12-01`;
  return `${y}-${pad(m - 1)}-01`;
}
