import assert from "node:assert/strict";
import { createGazeHoldTracker } from "../src/lib/cv/face/gaze-hold.ts";
import { createSitStandTracker } from "../src/lib/cv/pose/sit-stand.ts";
import { resolveCvTrackMode } from "../src/lib/cv/track-mode.ts";

assert.equal(
  resolveCvTrackMode("gaze_stabilization", "Near-far focus switch"),
  "face_near_far",
);
assert.equal(
  resolveCvTrackMode("gaze_stabilization", "Thumb target (seated)"),
  "face_gaze_hold",
);
assert.equal(resolveCvTrackMode("balance_training", "Tandem stand"), "pose_balance");
assert.equal(
  resolveCvTrackMode("habituation", "Slow sit-to-stand with pause"),
  "pose_habituation",
);
assert.equal(
  resolveCvTrackMode("habituation", "Seated visual scan"),
  "face_presence",
);
assert.equal(resolveCvTrackMode("canalith_repositioning", "Orientation"), null);

const gaze = createGazeHoldTracker({
  irisTolerance: 0.05,
  yawEnter: 0.08,
  minConfidence: 0.6,
});
const anchor = { x: 0.5, y: 0.5 };
for (let i = 0; i < 6; i++) {
  gaze.addCalibrationSample({
    irisMid: { x: 0.52, y: 0.45 },
    faceAnchor: anchor,
    headYaw: 0,
    confidence: 0.9,
  });
}
assert.equal(gaze.finishCalibration(), true);

// Head turns with face-relative iris held (iris moves with face in absolute coords)
gaze.update({
  irisMid: { x: 0.42, y: 0.45 },
  faceAnchor: { x: 0.4, y: 0.5 },
  headYaw: -0.15,
  confidence: 0.9,
});
gaze.update({
  irisMid: { x: 0.62, y: 0.45 },
  faceAnchor: { x: 0.6, y: 0.5 },
  headYaw: 0.15,
  confidence: 0.9,
});
assert.equal(gaze.reps, 1);

// Absolute iris jumps without matching face anchor → drift, no count
gaze.update({
  irisMid: { x: 0.2, y: 0.45 },
  faceAnchor: { x: 0.5, y: 0.5 },
  headYaw: -0.15,
  confidence: 0.9,
});
gaze.update({
  irisMid: { x: 0.8, y: 0.45 },
  faceAnchor: { x: 0.5, y: 0.5 },
  headYaw: 0.15,
  confidence: 0.9,
});
assert.equal(gaze.reps, 1, "face-relative drift must not count");

const ss = createSitStandTracker({
  riseEnter: 0.05,
  settleBand: 0.02,
  minConfidence: 0.6,
});
ss.update({ shoulderY: 0.6, confidence: 0.9 });
ss.update({ shoulderY: 0.5, confidence: 0.9 });
ss.update({ shoulderY: 0.6, confidence: 0.9 });
assert.equal(ss.reps, 1);

console.log("test-phase-b-cv: ok");
