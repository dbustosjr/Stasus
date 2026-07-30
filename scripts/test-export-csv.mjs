#!/usr/bin/env node
import assert from "node:assert/strict";
import { buildExportCsv, csvField } from "../src/lib/export/csv.ts";
import {
  formatExportDateTime,
  formatExportDurationSeconds,
} from "../src/lib/export/format.ts";

assert.equal(csvField("plain"), "plain");
assert.equal(csvField('say "hi"'), '"say ""hi"""');
assert.equal(csvField("a,b"), '"a,b"');
assert.equal(csvField(null), "");

assert.equal(formatExportDurationSeconds(15), "15 sec");
assert.equal(formatExportDurationSeconds(90), "1 min 30 sec");

const local = formatExportDateTime(
  "2026-07-30T09:31:50.834Z",
  "America/Los_Angeles",
);
assert.match(local, /Jul 30, 2026/);
assert.match(local, /at/);
assert.doesNotMatch(local, /T09:31/);
assert.doesNotMatch(local, /\+00:00/);

const csv = buildExportCsv({
  exported_at: "2026-07-30T12:00:00.000Z",
  email: "a@b.co",
  timezone: "America/Los_Angeles",
  logs: [
    {
      logged_at: "2026-07-29T10:00:00.000Z",
      severity: 4,
      duration_minutes: 15,
      triggers: ["stress"],
      notes: "ok",
      archived: false,
    },
  ],
  sessions: [
    {
      completed_at: "2026-07-28T09:00:00.000Z",
      exercise_title: "Thumb target (seated)",
      duration_seconds: 90,
      notes: null,
    },
  ],
});

assert.match(csv, /# Symptom logs/);
assert.match(csv, /# Practice sessions/);
assert.match(csv, /# Time zone,America\/Los_Angeles/);
assert.match(csv, /Thumb target \(seated\)/);
assert.match(csv, /4\/10/);
assert.match(csv, /1 min 30 sec/);
assert.doesNotMatch(csv, /2026-07-29T10:00:00/);
console.log("export-csv: ok");
