import assert from "node:assert/strict";
import {
  parseCvConfidenceAvg,
  parseRepCount,
} from "../src/lib/sessions/parse-cv-fields.ts";

assert.deepEqual(parseRepCount(""), { ok: true, value: null });
assert.deepEqual(parseRepCount("  "), { ok: true, value: null });
assert.deepEqual(parseRepCount("0"), { ok: true, value: 0 });
assert.deepEqual(parseRepCount("12"), { ok: true, value: 12 });
assert.equal(parseRepCount("-1").ok, false);
assert.equal(parseRepCount("1.5").ok, false);
assert.equal(parseRepCount("abc").ok, false);

assert.deepEqual(parseCvConfidenceAvg(""), { ok: true, value: null });
assert.deepEqual(parseCvConfidenceAvg("  "), { ok: true, value: null });
assert.deepEqual(parseCvConfidenceAvg("0"), { ok: true, value: 0 });
assert.deepEqual(parseCvConfidenceAvg("1"), { ok: true, value: 1 });
assert.deepEqual(parseCvConfidenceAvg("0.85"), { ok: true, value: 0.85 });
assert.equal(parseCvConfidenceAvg("-0.1").ok, false);
assert.equal(parseCvConfidenceAvg("1.01").ok, false);
assert.equal(parseCvConfidenceAvg("nope").ok, false);

console.log("test-session-cv-fields: ok");
