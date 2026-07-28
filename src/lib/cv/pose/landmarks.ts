/** MediaPipe Pose Landmarker landmark indices used by Stasus checkers. */
export const NOSE = 0;
export const LEFT_SHOULDER = 11;
export const RIGHT_SHOULDER = 12;
export const LEFT_HIP = 23;
export const RIGHT_HIP = 24;

/** Key torso landmarks used for presence / confidence scoring. */
export const KEY_LANDMARK_INDICES = [
  NOSE,
  LEFT_SHOULDER,
  RIGHT_SHOULDER,
  LEFT_HIP,
  RIGHT_HIP,
] as const;
