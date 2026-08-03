import {
  KEY_LANDMARK_INDICES,
} from "@/lib/cv/pose/landmarks";
import {
  MEDIAPIPE_WASM_PATH,
  POSE_LANDMARKER_MODEL_URL,
  installTfLiteLogFilter,
} from "@/lib/cv/mediapipe-assets";

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
  const restoreLogs = installTfLiteLogFilter();

  try {
    const { FilesetResolver, PoseLandmarker } = await import(
      "@mediapipe/tasks-vision"
    );

    const wasm = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_PATH);
    const options = {
      baseOptions: {
        modelAssetPath: POSE_LANDMARKER_MODEL_URL,
        delegate: "GPU" as const,
      },
      runningMode: "VIDEO" as const,
      numPoses: 1,
    };
    let landmarker;
    try {
      landmarker = await PoseLandmarker.createFromOptions(wasm, options);
    } catch {
      landmarker = await PoseLandmarker.createFromOptions(wasm, {
        ...options,
        baseOptions: { ...options.baseOptions, delegate: "CPU" },
      });
    }

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
        try {
          landmarker.close();
        } finally {
          restoreLogs();
        }
      },
    };
  } catch (error) {
    restoreLogs();
    throw error;
  }
}
