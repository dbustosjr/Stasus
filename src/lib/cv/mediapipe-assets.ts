/** Shared MediaPipe WASM CDN (matches @mediapipe/tasks-vision). */
export const MEDIAPIPE_WASM_CDN =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.0/wasm";

export const POSE_LANDMARKER_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

export const FACE_LANDMARKER_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

const TFLITE_NOISE =
  /tensorflow lite|tflite|xnnpack|created .+ delegate|INFO:\s*Created/i;

function isTfLiteNoise(args: unknown[]): boolean {
  return args.some((arg) => TFLITE_NOISE.test(String(arg)));
}

/**
 * TFLite logs XNNPACK INFO asynchronously. Keep filter for engine lifetime.
 */
export function installTfLiteLogFilter(): () => void {
  if (typeof console === "undefined") return () => {};

  const methods = ["log", "info", "debug", "warn", "error"] as const;
  const originals = methods.map((name) => console[name].bind(console));

  for (let i = 0; i < methods.length; i++) {
    const name = methods[i];
    const original = originals[i];
    console[name] = ((...args: unknown[]) => {
      if (isTfLiteNoise(args)) return;
      original(...args);
    }) as typeof console.log;
  }

  return () => {
    methods.forEach((name, i) => {
      console[name] = originals[i];
    });
  };
}
