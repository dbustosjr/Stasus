#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  WELLNESS_REPORT_DISCLAIMER,
  splitInsightDisclaimer,
  withDisclaimer,
} from "../src/lib/ai/disclaimer.ts";

const body = "You logged a moderate evening. Sleep showed up again.";
const stored = withDisclaimer(body);
assert.match(stored, /not medical advice/);
assert.doesNotMatch(stored, /\n—\n/);

const split = splitInsightDisclaimer(stored);
assert.equal(split.body, body);
assert.equal(split.showDisclaimer, true);

const legacy = `${body}\n\n—\n${WELLNESS_REPORT_DISCLAIMER}`;
const splitLegacy = splitInsightDisclaimer(legacy);
assert.equal(splitLegacy.body, body);
assert.equal(splitLegacy.showDisclaimer, true);

const bare = "Just a note without a footer.";
const splitBare = splitInsightDisclaimer(bare);
assert.equal(splitBare.body, bare);
assert.equal(splitBare.showDisclaimer, true);

console.log("insight-disclaimer: ok");
