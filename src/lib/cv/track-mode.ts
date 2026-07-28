export type CvTrackMode =
  | "pose_balance"
  | "pose_habituation"
  | "face_gaze_hold"
  | "face_near_far";

/**
 * Pick on-device tracker for an exercise.
 * Canalith stays camera-off (education-only content).
 */
export function resolveCvTrackMode(
  category: string,
  title: string,
): CvTrackMode | null {
  if (category === "canalith_repositioning") return null;

  if (category === "gaze_stabilization") {
    if (/near-far|near far/i.test(title)) return "face_near_far";
    return "face_gaze_hold";
  }

  if (category === "balance_training") return "pose_balance";

  if (category === "habituation") {
    if (/sit-to-stand|sit to stand/i.test(title)) return "pose_habituation";
    // Visual habituation: face presence / gaze hold light
    return "face_gaze_hold";
  }

  return null;
}

export function cvModeCopy(mode: CvTrackMode): string {
  switch (mode) {
    case "face_gaze_hold":
      return "Eye-target check (iris). Keep looking at your target while you move gently.";
    case "face_near_far":
      return "Near–far focus check (face distance). Switch slowly between near and far targets.";
    case "pose_balance":
      return "Pose check — stay centered in frame with support nearby.";
    case "pose_habituation":
      return "Pose check — we’ll watch sit-to-stand presence, not form perfection.";
  }
}
