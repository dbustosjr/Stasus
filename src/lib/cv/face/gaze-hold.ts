export type Point2 = { x: number; y: number };

export type GazeHoldSample = {
  /** Iris midpoint in image coords. */
  irisMid: Point2;
  /** Face anchor (nose or cheek mid) in image coords. */
  faceAnchor: Point2;
  headYaw: number;
  confidence: number;
};

export type GazeHoldOptions = {
  /** Max face-relative iris drift from calibration. */
  irisTolerance: number;
  /** |yaw| must exceed this to count as a head turn extreme. */
  yawEnter: number;
  minConfidence: number;
};

function relativeIris(iris: Point2, anchor: Point2): Point2 {
  return { x: iris.x - anchor.x, y: iris.y - anchor.y };
}

/**
 * Calibrate gaze relative to the face (not absolute screen position).
 * Absolute iris drifts whenever the head turns — that falsely flagged "gaze drift".
 * Counts left↔right head turns while face-relative iris stays near the calibrated offset.
 */
export function createGazeHoldTracker(opts: GazeHoldOptions) {
  let calibratedRel: Point2 | null = null;
  let calibSum = { x: 0, y: 0 };
  let calibCount = 0;
  let reps = 0;
  let lastExtreme: "center" | "left" | "right" = "center";
  let sawStableOnCurrentExtreme = false;

  return {
    get reps() {
      return reps;
    },
    get calibrated() {
      return calibratedRel != null;
    },
    addCalibrationSample(sample: GazeHoldSample) {
      if (sample.confidence < opts.minConfidence) return;
      const rel = relativeIris(sample.irisMid, sample.faceAnchor);
      calibSum.x += rel.x;
      calibSum.y += rel.y;
      calibCount += 1;
    },
    finishCalibration() {
      if (calibCount < 5) return false;
      calibratedRel = {
        x: calibSum.x / calibCount,
        y: calibSum.y / calibCount,
      };
      return true;
    },
    update(sample: GazeHoldSample): "ok" | "gaze_drift" | "low_confidence" {
      if (sample.confidence < opts.minConfidence) return "low_confidence";
      if (!calibratedRel) return "low_confidence";

      const rel = relativeIris(sample.irisMid, sample.faceAnchor);
      const err = Math.hypot(
        rel.x - calibratedRel.x,
        rel.y - calibratedRel.y,
      );
      const gazeOk = err <= opts.irisTolerance;

      let side: "center" | "left" | "right" = "center";
      if (sample.headYaw <= -opts.yawEnter) side = "left";
      else if (sample.headYaw >= opts.yawEnter) side = "right";

      if (side === "left" || side === "right") {
        if (side !== lastExtreme) {
          // Completed a turn to the opposite side with gaze held on the way.
          if (
            lastExtreme !== "center" &&
            sawStableOnCurrentExtreme &&
            gazeOk
          ) {
            reps += 1;
          }
          lastExtreme = side;
          sawStableOnCurrentExtreme = gazeOk;
        } else if (gazeOk) {
          sawStableOnCurrentExtreme = true;
        }
      }

      return gazeOk ? "ok" : "gaze_drift";
    },
    reset() {
      reps = 0;
      lastExtreme = "center";
      sawStableOnCurrentExtreme = false;
      calibratedRel = null;
      calibSum = { x: 0, y: 0 };
      calibCount = 0;
    },
  };
}
