import assert from "node:assert/strict";
import { checkBalancePresence } from "../src/lib/cv/pose/balance-presence.ts";

const centered = {
  leftShoulder: { x: 0.4, y: 0.3, visibility: 0.9 },
  rightShoulder: { x: 0.6, y: 0.3, visibility: 0.9 },
  leftHip: { x: 0.42, y: 0.7, visibility: 0.85 },
  rightHip: { x: 0.58, y: 0.7, visibility: 0.8 },
};
const ok = checkBalancePresence(centered);
assert.equal(ok.ok, true);
assert.equal(ok.reason, "ok");
assert.equal(ok.confidence, 0.8);

const lowConf = checkBalancePresence({
  leftShoulder: { x: 0.4, y: 0.3, visibility: 0.9 },
  rightShoulder: { x: 0.6, y: 0.3, visibility: 0.5 },
  leftHip: { x: 0.42, y: 0.7, visibility: 0.85 },
  rightHip: { x: 0.58, y: 0.7, visibility: 0.8 },
});
assert.equal(lowConf.ok, false);
assert.equal(lowConf.reason, "low_confidence");
assert.equal(lowConf.confidence, 0.5);

const outOfFrame = checkBalancePresence({
  leftShoulder: { x: 0.05, y: 0.3, visibility: 0.9 },
  rightShoulder: { x: 0.15, y: 0.3, visibility: 0.9 },
  leftHip: { x: 0.05, y: 0.7, visibility: 0.9 },
  rightHip: { x: 0.15, y: 0.7, visibility: 0.9 },
});
assert.equal(outOfFrame.ok, false);
assert.equal(outOfFrame.reason, "out_of_frame");
assert.equal(outOfFrame.confidence, 0.9);

const missingVis = checkBalancePresence({
  leftShoulder: { x: 0.4, y: 0.3 },
  rightShoulder: { x: 0.6, y: 0.3 },
  leftHip: { x: 0.42, y: 0.7 },
  rightHip: { x: 0.58, y: 0.7 },
});
assert.equal(missingVis.ok, true);
assert.equal(missingVis.reason, "ok");
assert.equal(missingVis.confidence, 1);

const edgeOk = checkBalancePresence({
  leftShoulder: { x: 0.2, y: 0.15, visibility: 0.6 },
  rightShoulder: { x: 0.2, y: 0.15, visibility: 0.6 },
  leftHip: { x: 0.2, y: 0.15, visibility: 0.6 },
  rightHip: { x: 0.2, y: 0.15, visibility: 0.6 },
});
assert.equal(edgeOk.ok, true);
assert.equal(edgeOk.reason, "ok");
assert.equal(edgeOk.confidence, 0.6);

console.log("test-balance-presence: ok");
