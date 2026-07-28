import {
  KEY_LANDMARK_INDICES,
} from "@/lib/cv/pose/landmarks";

/**
 * CDN assets for MediaPipe Vision Tasks (not vendored in-repo).
 * WASM fileset root — matches installed @mediapipe/tasks-vision version.
 * Model — Google Cloud Storage pose_landmarker_lite.
 */
export const MEDIAPIPE_WASM_CDN =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.0/wasm";

export const POSE_LANDMARKER_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

export type PoseLandmark = {
  x: number;
  y: number;
  z: number;
  visibility?: number;
};

export type PoseDetection = {
  landmarks: PoseLandmark[];
  confidence: number;
};

export type PoseEngine = {
  detect(video: HTMLVideoElement, timestampMs: number): PoseDetection | null;
  close(): void;
};

function averageKeyVisibility(landmarks: PoseLandmark[]): number {
  let sum = 0;
  let count = 0;
  for (const index of KEY_LANDMARK_INDICES) {
    const lm = landmarks[index];
    if (!lm) continue;
    const v = lm.visibility;
    if (typeof v === "number" && Number.isFinite(v)) {
      sum += v;
      count += 1;
    }
  }
  return count > 0 ? sum / count : 0;
}

/**
 * Creates a client-side Pose Landmarker wrapper.
 * Dynamically imports `@mediapipe/tasks-vision` so the heavy WASM/runtime
 * only loads when this factory runs (call from client components only).
 */
export async function createPoseEngine(): Promise<PoseEngine> {
  const { FilesetResolver, PoseLandmarker } = await import(
    "@mediapipe/tasks-vision"
  );

  const wasm = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_CDN);
  const landmarker = await PoseLandmarker.createFromOptions(wasm, {
    baseOptions: {
      modelAssetPath: POSE_LANDMARKER_MODEL_URL,
    },
    runningMode: "VIDEO",
    numPoses: 1,
  });

  return {
    detect(video, timestampMs) {
      const result = landmarker.detectForVideo(video, timestampMs);
      const pose = result.landmarks[0];
      if (!pose || pose.length === 0) return null;

      const landmarks: PoseLandmark[] = pose.map((lm) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
        visibility: lm.visibility,
      }));

      return {
        landmarks,
        confidence: averageKeyVisibility(landmarks),
      };
    },
    close() {
      landmarker.close();
    },
  };
}
