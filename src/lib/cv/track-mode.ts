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
      return "Keep your eyes on your target while you turn your head slowly. We count turns where your gaze stays with it.";
    case "face_near_far":
      return "The webcam can’t see eye focus directly. Stay in frame and tap “Count switch” each time you go near to far or far to near.";
    case "face_presence":
      return "Stay in view while you do the visual practice. This is a timer only. No fake rep counting.";
    case "pose_balance":
      return "Stay centered in the frame with support nearby. Timer only. How you hold matters more than reps.";
    case "pose_habituation":
      return "When you’re in frame, we count sit-to-stand cycles from your shoulders. Move slowly.";
  }
}

export function guideForMode(mode: CvTrackMode): "face" | "torso" {
  return mode === "pose_balance" || mode === "pose_habituation"
    ? "torso"
    : "face";
}

/**
 * Modes where on-device signals are strong enough to offer optional
 * "practice feedback" (still not a clinical form grade).
 */
export function supportsFormFeedback(mode: CvTrackMode): boolean {
  return mode === "face_gaze_hold" || mode === "pose_habituation";
}

export type CameraPracticeMode = "feedback" | "preview";

export function cameraPracticeModeCopy(
  trackMode: CvTrackMode,
  practiceMode: CameraPracticeMode,
): string {
  if (practiceMode === "preview") {
    return "You’ll see yourself on this device and can time the session. Count reps yourself if you want. No form or correctness scoring.";
  }
  switch (trackMode) {
    case "face_gaze_hold":
      return "Optional feedback: we estimate whether your gaze stayed with the target while you turn. Practice support only — not a form grade or medical clearance.";
    case "pose_habituation":
      return "Optional feedback: we count sit-to-stand cycles from your shoulders when you’re in frame. Practice support only — not a form grade or medical clearance.";
    default:
      return cvModeCopy(trackMode);
  }
}
