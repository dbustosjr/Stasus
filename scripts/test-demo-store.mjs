import assert from "node:assert/strict";
import {
  addDemoSymptomLog,
  appendDemoInsightFromPool,
  getDemoState,
  parseDemoState,
  resetDemoState,
  saveDemoState,
  setDemoStorageForTests,
} from "../src/lib/demo/store.ts";
import { createDemoSeed } from "../src/lib/demo/fixtures/seed.ts";

function memory() {
  const map = new Map();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, v),
    removeItem: (k) => map.delete(k),
  };
}

setDemoStorageForTests(memory());

const seed = createDemoSeed();
assert.equal(seed.version, 1);
assert.ok(seed.exercises.length >= 8);
assert.ok(seed.symptomLogs.length >= 5);
assert.ok(seed.insights.some((i) => i.cadence === "weekly"));

assert.equal(parseDemoState(null).version, 1);
assert.equal(parseDemoState("{not-json").version, 1);
assert.equal(parseDemoState(JSON.stringify({ version: 2 })).version, 1);

resetDemoState();
let state = getDemoState();
const beforeLogs = state.symptomLogs.length;
state = addDemoSymptomLog(state, {
  severity: 5,
  duration_minutes: 10,
  triggers: ["stress_level"],
  notes: "demo note",
  customTriggerLabel: "Demo custom",
});
saveDemoState(state);
state = getDemoState();
assert.equal(state.symptomLogs.length, beforeLogs + 1);
assert.equal(state.symptomLogs[0].severity, 5);
assert.ok(state.customTriggers.some((t) => t.label === "Demo custom"));

const beforeInsights = state.insights.length;
state = appendDemoInsightFromPool(state);
saveDemoState(state);
state = getDemoState();
assert.equal(state.insights.length, beforeInsights + 1);
assert.equal(state.insights[0].cadence, "weekly");

setDemoStorageForTests(null);
console.log("test-demo-store: ok");
