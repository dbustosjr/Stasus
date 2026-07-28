/**
 * Counts sit-to-stand from shoulder height (more visible on laptop webcams
 * than hips, which often leave the frame).
 */
export type SitStandSample = {
  /** Smaller y = higher in frame (MediaPipe). */
  shoulderY: number;
  confidence: number;
};

export type SitStandOptions = {
  /** How much shoulderY must drop (rise in frame) to count as standing. */
  riseEnter: number;
  /** How close to baseline to count as seated again. */
  settleBand: number;
  minConfidence: number;
};

export function createSitStandTracker(opts: SitStandOptions) {
  let reps = 0;
  let baselineY: number | null = null;
  let phase: "seated" | "standing" = "seated";

  return {
    get reps() {
      return reps;
    },
    update(sample: SitStandSample): "ok" | "low_confidence" {
      if (sample.confidence < opts.minConfidence) return "low_confidence";

      if (baselineY == null) {
        baselineY = sample.shoulderY;
        return "ok";
      }

      // Slowly adapt baseline while seated so framing drift doesn’t lock us out.
      if (phase === "seated") {
        baselineY = baselineY * 0.98 + sample.shoulderY * 0.02;
      }

      const rise = baselineY - sample.shoulderY; // positive when shoulders move up

      if (phase === "seated" && rise >= opts.riseEnter) {
        phase = "standing";
      } else if (
        phase === "standing" &&
        sample.shoulderY >= baselineY - opts.settleBand
      ) {
        reps += 1;
        phase = "seated";
        baselineY = sample.shoulderY;
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
