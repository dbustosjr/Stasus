import assert from "node:assert/strict";
import {
  createHeadYawTracker,
  yawFromPoseLandmarks,
} from "../src/lib/cv/pose/head-yaw.ts";

const t = createHeadYawTracker({
  enterThreshold: 0.12,
  returnThreshold: 0.04,
  minConfidence: 0.6,
});

assert.equal(t.reps, 0);
t.update({ yaw: -0.2, confidence: 0.9 }); // left
t.update({ yaw: 0.2, confidence: 0.9 }); // right → 1 cycle
assert.equal(t.reps, 1);

t.update({ yaw: -0.2, confidence: 0.2 }); // low conf ignored
t.update({ yaw: 0.2, confidence: 0.2 });
assert.equal(t.reps, 1, "low confidence must not count");

t.reset();
assert.equal(t.reps, 0, "reset clears reps");

const centered = yawFromPoseLandmarks({
  nose: { x: 0.5 },
  leftShoulder: { x: 0.4 },
  rightShoulder: { x: 0.6 },
});
assert.equal(centered.yaw, 0);
assert.equal(centered.confidence, 1);

const leftish = yawFromPoseLandmarks({
  nose: { x: 0.35, visibility: 0.9 },
  leftShoulder: { x: 0.4, visibility: 0.8 },
  rightShoulder: { x: 0.6, visibility: 0.7 },
});
assert.ok(leftish.yaw < 0);
assert.equal(leftish.confidence, 0.7);

console.log("test-head-yaw: ok");
