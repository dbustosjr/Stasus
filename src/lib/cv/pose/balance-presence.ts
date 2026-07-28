export type Landmark2D = {
  x: number;
  y: number;
  visibility?: number;
};

export type BalancePresenceInput = {
  leftShoulder: Landmark2D;
  rightShoulder: Landmark2D;
  leftHip: Landmark2D;
  rightHip: Landmark2D;
};

export type BalancePresenceResult = {
  ok: boolean;
  confidence: number;
  reason: "low_confidence" | "out_of_frame" | "ok";
};

const MIN_VISIBILITY = 0.6;
const X_MIN = 0.2;
const X_MAX = 0.8;
const Y_MIN = 0.15;
const Y_MAX = 0.85;

/**
 * Checks whether the torso is confidently visible and roughly centered in frame.
 * Used to gate balance/pose coaching cues when the subject is out of view.
 */
export function checkBalancePresence(
  lm: BalancePresenceInput,
): BalancePresenceResult {
  const points = [lm.leftShoulder, lm.rightShoulder, lm.leftHip, lm.rightHip];
  const confidence = Math.min(...points.map((p) => p.visibility ?? 1));

  if (confidence < MIN_VISIBILITY) {
    return { ok: false, confidence, reason: "low_confidence" };
  }

  const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const inFrame =
    cx >= X_MIN && cx <= X_MAX && cy >= Y_MIN && cy <= Y_MAX;

  if (!inFrame) {
    return { ok: false, confidence, reason: "out_of_frame" };
  }

  return { ok: true, confidence, reason: "ok" };
}
