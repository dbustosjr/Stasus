export type HeadYawSample = { yaw: number; confidence: number };

export type HeadYawOptions = {
  enterThreshold: number;
  returnThreshold: number;
  minConfidence: number;
};

type Side = "center" | "left" | "right";

/**
 * Counts left↔right head yaw cycles with hysteresis.
 * A rep is counted when the head moves from one extreme
 * (beyond enterThreshold) to the opposite extreme.
 */
export function createHeadYawTracker(opts: HeadYawOptions) {
  let reps = 0;
  let lastExtreme: Side = "center";

  return {
    get reps() {
      return reps;
    },
    update(sample: HeadYawSample) {
      if (sample.confidence < opts.minConfidence) return;

      let side: Side = "center";
      if (sample.yaw <= -opts.enterThreshold) side = "left";
      else if (sample.yaw >= opts.enterThreshold) side = "right";
      else if (Math.abs(sample.yaw) <= opts.returnThreshold) side = "center";
      else return; // dead band between return and enter thresholds

      if (side === "center") return;

      if (lastExtreme === "center") {
        lastExtreme = side;
        return;
      }

      if (side !== lastExtreme) {
        reps += 1;
        lastExtreme = side;
      }
    },
    reset() {
      reps = 0;
      lastExtreme = "center";
    },
  };
}

/** Approximate yaw from nose vs shoulders (MediaPipe normalized coords). */
export function yawFromPoseLandmarks(lm: {
  nose: { x: number; visibility?: number };
  leftShoulder: { x: number; visibility?: number };
  rightShoulder: { x: number; visibility?: number };
}): HeadYawSample {
  const midX = (lm.leftShoulder.x + lm.rightShoulder.x) / 2;
  const yaw = lm.nose.x - midX;
  const confidence = Math.min(
    lm.nose.visibility ?? 1,
    lm.leftShoulder.visibility ?? 1,
    lm.rightShoulder.visibility ?? 1,
  );
  return { yaw, confidence };
}
