#!/usr/bin/env node
import assert from "node:assert/strict";
import { polishInsightProse } from "../src/lib/ai/polish-insight.ts";

assert.equal(
  polishInsightProse("Try **calm tools** and *rest* tonight."),
  "Try calm tools and rest tonight.",
);
assert.equal(
  polishInsightProse("Sleep showed up—again—today."),
  "Sleep showed up, again, today.",
);
assert.doesNotMatch(polishInsightProse("* Keep going\n* Soften"), /\*/);
console.log("polish-insight: ok");
