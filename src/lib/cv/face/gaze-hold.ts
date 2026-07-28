export type Point2 = { x: number; y: number };

export type GazeHoldSample = {
  irisMid: Point2;
  headYaw: number;
  confidence: number;
};

export type GazeHoldOptions = {
  /** Max iris distance from calibrated target (normalized). */
  irisTolerance: number;
  /** |yaw| must exceed this to count as a head turn extreme. */
  yawEnter: number;
  minConfidence: number;
};

/**
 * Calibrate a gaze target (average iris mid while looking at thumb/wall mark),
 * then count left↔right head turns where gaze stays near that target.
 */
export function createGazeHoldTracker(opts: GazeHoldOptions) {
  let calibrated: Point2 | null = null;
  let calibSum = { x: 0, y: 0 };
  let calibCount = 0;
  let reps = 0;
  let lastExtreme: "center" | "left" | "right" = "center";
  let stableOnExtreme = false;

  return {
    get reps() {
      return reps;
    },
    get calibrated() {
      return calibrated != null;
    },
    /** Accumulate samples while user holds still on target (~1–2s). */
    addCalibrationSample(sample: GazeHoldSample) {
      if (sample.confidence < opts.minConfidence) return;
      calibSum.x += sample.irisMid.x;
      calibSum.y += sample.irisMid.y;
      calibCount += 1;
    },
    finishCalibration() {
      if (calibCount < 5) return false;
      calibrated = {
        x: calibSum.x / calibCount,
        y: calibSum.y / calibCount,
      };
      return true;
    },
    irisError(sample: GazeHoldSample): number | null {
      if (!calibrated) return null;
      return Math.hypot(
        sample.irisMid.x - calibrated.x,
        sample.irisMid.y - calibrated.y,
      );
    },
    update(sample: GazeHoldSample): "ok" | "gaze_drift" | "low_confidence" {
      if (sample.confidence < opts.minConfidence) return "low_confidence";
      if (!calibrated) return "low_confidence";

      const err = Math.hypot(
        sample.irisMid.x - calibrated.x,
        sample.irisMid.y - calibrated.y,
      );
      const gazeOk = err <= opts.irisTolerance;

      let side: "center" | "left" | "right" = "center";
      if (sample.headYaw <= -opts.yawEnter) side = "left";
      else if (sample.headYaw >= opts.yawEnter) side = "right";

      if (side === "left" || side === "right") {
        if (gazeOk) stableOnExtreme = true;
        if (
          lastExtreme !== "center" &&
          side !== lastExtreme &&
          stableOnExtreme &&
          gazeOk
        ) {
          reps += 1;
          stableOnExtreme = gazeOk;
        }
        if (lastExtreme === "center" || side !== lastExtreme) {
          lastExtreme = side;
          if (!gazeOk) stableOnExtreme = false;
        }
      }

      return gazeOk ? "ok" : "gaze_drift";
    },
    reset() {
      reps = 0;
      lastExtreme = "center";
      stableOnExtreme = false;
      calibrated = null;
      calibSum = { x: 0, y: 0 };
      calibCount = 0;
    },
  };
}
