import assert from "node:assert/strict";
import { createGazeHoldTracker } from "../src/lib/cv/face/gaze-hold.ts";
import { createNearFarTracker } from "../src/lib/cv/face/near-far.ts";
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
assert.equal(resolveCvTrackMode("canalith_repositioning", "Orientation"), null);

const gaze = createGazeHoldTracker({
  irisTolerance: 0.05,
  yawEnter: 0.08,
  minConfidence: 0.6,
});
for (let i = 0; i < 6; i++) {
  gaze.addCalibrationSample({
    irisMid: { x: 0.5, y: 0.45 },
    headYaw: 0,
    confidence: 0.9,
  });
}
assert.equal(gaze.finishCalibration(), true);

gaze.update({ irisMid: { x: 0.5, y: 0.45 }, headYaw: -0.15, confidence: 0.9 });
gaze.update({ irisMid: { x: 0.5, y: 0.45 }, headYaw: 0.15, confidence: 0.9 });
assert.equal(gaze.reps, 1);

gaze.update({ irisMid: { x: 0.8, y: 0.45 }, headYaw: -0.15, confidence: 0.9 });
gaze.update({ irisMid: { x: 0.8, y: 0.45 }, headYaw: 0.15, confidence: 0.9 });
assert.equal(gaze.reps, 1, "drifted gaze must not count");

const nf = createNearFarTracker({
  nearEnterRatio: 0.15,
  farEnterRatio: 0.15,
  minConfidence: 0.6,
});
for (let i = 0; i < 6; i++) {
  nf.addBaselineSample({ faceScale: 0.1, confidence: 0.9 });
}
assert.equal(nf.finishBaseline(), true);
nf.update({ faceScale: 0.13, confidence: 0.9 }); // near
nf.update({ faceScale: 0.07, confidence: 0.9 }); // far → 1
assert.equal(nf.reps, 1);

const ss = createSitStandTracker({
  riseEnter: 0.05,
  settleBand: 0.02,
  minConfidence: 0.6,
});
ss.update({ torsoY: 0.6, confidence: 0.9 }); // baseline seated
ss.update({ torsoY: 0.5, confidence: 0.9 }); // rising
ss.update({ torsoY: 0.45, confidence: 0.9 }); // standing
ss.update({ torsoY: 0.6, confidence: 0.9 }); // settle → 1
assert.equal(ss.reps, 1);

console.log("test-phase-b-cv: ok");
