export type NearFarSample = {
  /** Interpupillary / face scale — larger when closer to camera. */
  faceScale: number;
  confidence: number;
};

export type NearFarOptions = {
  /** Relative rise above rolling mid to enter "near". */
  nearEnterRatio: number;
  /** Relative drop below rolling mid to enter "far". */
  farEnterRatio: number;
  minConfidence: number;
};

/**
 * Counts near↔far focus cycles using face scale (closer ⇒ larger in frame).
 */
export function createNearFarTracker(opts: NearFarOptions) {
  let reps = 0;
  let baseline = 0;
  let baselineCount = 0;
  let zone: "mid" | "near" | "far" = "mid";
  let lastExtreme: "mid" | "near" | "far" = "mid";

  return {
    get reps() {
      return reps;
    },
    /** Seed baseline while user sits at a comfortable mid distance. */
    addBaselineSample(sample: NearFarSample) {
      if (sample.confidence < opts.minConfidence) return;
      baseline += sample.faceScale;
      baselineCount += 1;
    },
    finishBaseline() {
      if (baselineCount < 5) return false;
      baseline = baseline / baselineCount;
      return baseline > 0;
    },
    update(sample: NearFarSample): "ok" | "low_confidence" | "need_baseline" {
      if (sample.confidence < opts.minConfidence) return "low_confidence";
      if (baselineCount < 5 || baseline <= 0) return "need_baseline";

      const nearThresh = baseline * (1 + opts.nearEnterRatio);
      const farThresh = baseline * (1 - opts.farEnterRatio);

      if (sample.faceScale >= nearThresh) zone = "near";
      else if (sample.faceScale <= farThresh) zone = "far";
      else zone = "mid";

      if (zone === "near" || zone === "far") {
        if (
          lastExtreme !== "mid" &&
          lastExtreme !== zone &&
          (lastExtreme === "near" || lastExtreme === "far")
        ) {
          reps += 1;
        }
        lastExtreme = zone;
      }

      return "ok";
    },
    reset() {
      reps = 0;
      baseline = 0;
      baselineCount = 0;
      zone = "mid";
      lastExtreme = "mid";
    },
  };
}
