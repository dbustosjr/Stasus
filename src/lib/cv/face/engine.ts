import {
  FACE_LANDMARKER_MODEL_URL,
  MEDIAPIPE_WASM_CDN,
  installTfLiteLogFilter,
} from "@/lib/cv/mediapipe-assets";

/** Iris centers (MediaPipe refined face mesh). */
export const LEFT_IRIS_CENTER = 468;
export const RIGHT_IRIS_CENTER = 473;
/** Nose tip — useful for crude head yaw. */
export const NOSE_TIP = 1;
export const LEFT_CHEEK = 234;
export const RIGHT_CHEEK = 454;

export type FaceLandmark = {
  x: number;
  y: number;
  z: number;
};

export type FaceDetection = {
  landmarks: FaceLandmark[];
  /** Midpoint of both iris centers (normalized). */
  irisMid: { x: number; y: number };
  /** Approximate head yaw: nose x relative to cheek mid. */
  headYaw: number;
  /** Face scale proxy (interpupillary distance). Larger ≈ closer to camera. */
  faceScale: number;
  confidence: number;
};

export type FaceEngine = {
  detect(video: HTMLVideoElement, timestampMs: number): FaceDetection | null;
  close(): void;
};

function avg(
  a: FaceLandmark | undefined,
  b: FaceLandmark | undefined,
): { x: number; y: number; z: number } | null {
  if (!a || !b) return null;
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
  };
}

export async function createFaceEngine(): Promise<FaceEngine> {
  const restoreLogs = installTfLiteLogFilter();

  try {
    const { FilesetResolver, FaceLandmarker } = await import(
      "@mediapipe/tasks-vision"
    );

    const wasm = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_CDN);
    const landmarker = await FaceLandmarker.createFromOptions(wasm, {
      baseOptions: {
        modelAssetPath: FACE_LANDMARKER_MODEL_URL,
      },
      runningMode: "VIDEO",
      numFaces: 1,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });

    return {
      detect(video, timestampMs) {
        const result = landmarker.detectForVideo(video, timestampMs);
        const face = result.faceLandmarks[0];
        if (!face || face.length < 478) return null;

        const landmarks: FaceLandmark[] = face.map((lm) => ({
          x: lm.x,
          y: lm.y,
          z: lm.z,
        }));

        const leftIris = landmarks[LEFT_IRIS_CENTER];
        const rightIris = landmarks[RIGHT_IRIS_CENTER];
        const irisMidPt = avg(leftIris, rightIris);
        if (!irisMidPt || !leftIris || !rightIris) return null;

        const leftCheek = landmarks[LEFT_CHEEK];
        const rightCheek = landmarks[RIGHT_CHEEK];
        const nose = landmarks[NOSE_TIP];
        if (!leftCheek || !rightCheek || !nose) return null;

        const cheekMidX = (leftCheek.x + rightCheek.x) / 2;
        const headYaw = nose.x - cheekMidX;
        const faceScale = Math.hypot(
          leftIris.x - rightIris.x,
          leftIris.y - rightIris.y,
        );

        // Presence confidence proxy from landmark spread being finite.
        const confidence = Number.isFinite(faceScale) && faceScale > 0.01 ? 0.85 : 0.4;

        return {
          landmarks,
          irisMid: { x: irisMidPt.x, y: irisMidPt.y },
          headYaw,
          faceScale,
          confidence,
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
