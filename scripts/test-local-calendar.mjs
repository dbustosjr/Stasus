#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  localDateString,
  localMonthStart,
  localWeekStartMonday,
  normalizeTimeZone,
} from "../src/lib/time/local-calendar.ts";

// Fixed instant: 2026-07-29 20:00 UTC = afternoon in California, evening NY
const instant = new Date("2026-07-29T20:00:00.000Z");

assert.equal(normalizeTimeZone("America/Los_Angeles"), "America/Los_Angeles");
assert.equal(normalizeTimeZone("not-a-zone"), "UTC");

assert.equal(localDateString("America/Los_Angeles", instant), "2026-07-29");
assert.equal(localDateString("America/New_York", instant), "2026-07-29");
assert.equal(localDateString("UTC", instant), "2026-07-29");

// Monday of that week in LA (Jul 29 2026 is Wednesday → Monday Jul 27)
assert.equal(
  localWeekStartMonday("America/Los_Angeles", instant),
  "2026-07-27",
);
assert.equal(localMonthStart("America/Los_Angeles", instant), "2026-07-01");

// Early UTC morning that is still previous evening in LA
const early = new Date("2026-07-30T06:00:00.000Z"); // Jul 29 evening PDT
assert.equal(localDateString("America/Los_Angeles", early), "2026-07-29");
assert.equal(localDateString("UTC", early), "2026-07-30");

console.log("local-calendar: ok");
