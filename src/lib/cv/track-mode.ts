export type CvTrackMode =
  | "pose_balance"
  | "pose_habituation"
  | "face_gaze_hold"
  | "face_near_far"
  | "face_presence";

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
    // Visual exposure — presence only (not VOR head-turn counting).
    return "face_presence";
  }

  return null;
}

export function cvModeCopy(mode: CvTrackMode): string {
  switch (mode) {
    case "face_gaze_hold":
      return "Keep your eyes on your target while you turn your head slowly. We’ll count turns where your gaze stays with it.";
    case "face_near_far":
      return "Webcam can’t see eye focus directly — stay in frame and tap “Count switch” each time you go near→far (or far→near).";
    case "face_presence":
      return "Stay gently in view while you do the visual practice. Timer only — no fake rep counting.";
    case "pose_balance":
      return "Stay centered in frame with support nearby. Timer only — hold quality matters more than reps.";
    case "pose_habituation":
      return "We’ll count sit-to-stand cycles from your shoulders when you’re in frame. Move slowly.";
  }
}

export function guideForMode(mode: CvTrackMode): "face" | "torso" {
  return mode === "pose_balance" || mode === "pose_habituation"
    ? "torso"
    : "face";
}
