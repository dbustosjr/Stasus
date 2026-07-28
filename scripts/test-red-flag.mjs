import assert from "node:assert/strict";

const COMPANION_SIGNS = [
  "slurred_speech",
  "facial_drooping",
  "limb_weakness",
  "sudden_severe_headache",
];

function evaluateRedFlag(signals) {
  const set = new Set(signals);
  const hasSuddenSevereVertigo = set.has("sudden_severe_vertigo");
  const companions = COMPANION_SIGNS.filter((id) => set.has(id));
  if (hasSuddenSevereVertigo && companions.length > 0) {
    return {
      triggered: true,
      pattern: `sudden_severe_vertigo+${companions.sort().join("+")}`,
      matched: ["sudden_severe_vertigo", ...companions],
    };
  }
  return { triggered: false, pattern: null, matched: [] };
}

assert.equal(evaluateRedFlag(["sudden_severe_vertigo"]).triggered, false);
assert.equal(evaluateRedFlag(["slurred_speech"]).triggered, false);
const hit = evaluateRedFlag(["sudden_severe_vertigo", "facial_drooping"]);
assert.equal(hit.triggered, true);
assert.ok(hit.pattern.includes("sudden_severe_vertigo"));
console.log("red-flag tests passed");
