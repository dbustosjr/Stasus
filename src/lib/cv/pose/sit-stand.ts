/**
 * Counts sit-to-stand cycles from hip/shoulder vertical rise then settle.
 * Uses normalized pose y (higher on screen = smaller y in MediaPipe).
 */
export type SitStandSample = {
  torsoY: number;
  confidence: number;
};

export type SitStandOptions = {
  riseEnter: number;
  settleBand: number;
  minConfidence: number;
};

export function createSitStandTracker(opts: SitStandOptions) {
  let reps = 0;
  let baselineY: number | null = null;
  let phase: "seated" | "rising" | "standing" = "seated";

  return {
    get reps() {
      return reps;
    },
    update(sample: SitStandSample): "ok" | "low_confidence" {
      if (sample.confidence < opts.minConfidence) return "low_confidence";

      if (baselineY == null) {
        baselineY = sample.torsoY;
        return "ok";
      }

      const delta = baselineY - sample.torsoY; // positive when torso moves up in frame

      if (phase === "seated" && delta >= opts.riseEnter) {
        phase = "rising";
      } else if (phase === "rising" && delta >= opts.riseEnter * 1.2) {
        phase = "standing";
      } else if (
        phase === "standing" &&
        Math.abs(sample.torsoY - baselineY) <= opts.settleBand
      ) {
        reps += 1;
        phase = "seated";
        baselineY = sample.torsoY;
      }

      return "ok";
    },
    reset() {
      reps = 0;
      baselineY = null;
      phase = "seated";
    },
  };
}
