#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  buildTrendPoints,
  DEFAULT_TREND_PREFS,
  parseTrendPrefs,
} from "../src/lib/tracker/severity-trend.ts";

const logs = [
  {
    id: "a",
    severity: 4,
    triggers: ["stress"],
    notes: "n1",
    logged_at: "2026-07-29T18:00:00.000Z",
  },
  {
    id: "b",
    severity: 6,
    triggers: [],
    notes: null,
    logged_at: "2026-07-29T12:00:00.000Z",
  },
  {
    id: "c",
    severity: 5,
    triggers: ["food"],
    notes: "n2",
    logged_at: "2026-07-28T18:00:00.000Z",
  },
];

const entries = buildTrendPoints(logs, {
  mode: "entries",
  preset: 2,
  timeZone: "UTC",
});
assert.equal(entries.length, 2);
assert.equal(entries[0].kind, "entry");
assert.equal(entries[0].log.id, "b");
assert.equal(entries[1].log.id, "a");

const days = buildTrendPoints(logs, {
  mode: "days",
  preset: 7,
  timeZone: "UTC",
  now: new Date("2026-07-29T20:00:00.000Z"),
});
assert.equal(days.length, 2);
const jul29 = days.find((p) => p.kind === "day" && p.date === "2026-07-29");
assert.ok(jul29);
assert.equal(jul29.severity, 5); // (4+6)/2
assert.equal(jul29.logs.length, 2);

assert.deepEqual(parseTrendPrefs(null), DEFAULT_TREND_PREFS);
assert.equal(parseTrendPrefs('{"mode":"days","preset":90}').mode, "days");
assert.equal(parseTrendPrefs('{"mode":"days","preset":14}').preset, 30); // invalid for days → middle

console.log("severity-trend: ok");
