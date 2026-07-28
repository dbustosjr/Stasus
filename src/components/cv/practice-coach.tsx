"use client";

import { useEffect, useRef, useState } from "react";
import {
  saveCameraPracticeSession,
  type SessionFormState,
} from "@/app/actions/sessions";
import { CameraViewport } from "@/components/cv/camera-viewport";
import {
  TrackingStatus,
  type TrackingStatusKind,
} from "@/components/cv/tracking-status";
import {
  createFaceEngine,
  type FaceEngine,
} from "@/lib/cv/face/engine";
import { createGazeHoldTracker } from "@/lib/cv/face/gaze-hold";
import { createNearFarTracker } from "@/lib/cv/face/near-far";
import { checkBalancePresence } from "@/lib/cv/pose/balance-presence";
import {
  createPoseEngine,
  type PoseEngine,
} from "@/lib/cv/pose/engine";
import {
  LEFT_HIP,
  LEFT_SHOULDER,
  RIGHT_HIP,
  RIGHT_SHOULDER,
} from "@/lib/cv/pose/landmarks";
import { createSitStandTracker } from "@/lib/cv/pose/sit-stand";
import {
  cvModeCopy,
  resolveCvTrackMode,
  type CvTrackMode,
} from "@/lib/cv/track-mode";
import type { ExerciseCategory } from "@/lib/exercises/types";

const initialAction: SessionFormState = { error: null, ok: false };

const GAZE_OPTS = {
  irisTolerance: 0.06,
  yawEnter: 0.07,
  minConfidence: 0.55,
} as const;

const NEAR_FAR_OPTS = {
  nearEnterRatio: 0.12,
  farEnterRatio: 0.12,
  minConfidence: 0.55,
} as const;

const SIT_STAND_OPTS = {
  riseEnter: 0.04,
  settleBand: 0.025,
  minConfidence: 0.55,
} as const;

const CALIB_MS = 2000;

type Phase = "collapsed" | "privacy" | "calibrating" | "active" | "saving";
type AnyEngine = PoseEngine | FaceEngine;

type PracticeCoachProps = {
  exerciseId: string;
  category: ExerciseCategory;
  title: string;
};

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function needsCalibration(mode: CvTrackMode): boolean {
  return mode === "face_gaze_hold" || mode === "face_near_far";
}

function usesFace(mode: CvTrackMode): boolean {
  return mode === "face_gaze_hold" || mode === "face_near_far";
}

function countsReps(mode: CvTrackMode): boolean {
  return (
    mode === "face_gaze_hold" ||
    mode === "face_near_far" ||
    mode === "pose_habituation"
  );
}

function repLabel(mode: CvTrackMode): string {
  switch (mode) {
    case "face_gaze_hold":
      return "Stable gaze turns";
    case "face_near_far":
      return "Near–far switches";
    case "pose_habituation":
      return "Sit-to-stand cycles";
    default:
      return "Reps";
  }
}

/**
 * On-device practice coach (Pose and/or Face/iris). Camera never leaves the device.
 */
export function PracticeCoach({
  exerciseId,
  category,
  title,
}: PracticeCoachProps) {
  const mode =
    resolveCvTrackMode(category, title) ??
    (category === "balance_training"
      ? "pose_balance"
      : "face_gaze_hold");

  const [phase, setPhase] = useState<Phase>("collapsed");
  const [status, setStatus] = useState<TrackingStatusKind>("idle");
  const [statusDetail, setStatusDetail] = useState<string | null>(null);
  const [reps, setReps] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [startError, setStartError] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionState, setActionState] =
    useState<SessionFormState>(initialAction);
  const [calibProgress, setCalibProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const engineRef = useRef<AnyEngine | null>(null);
  const rafRef = useRef(0);
  const startedAtRef = useRef(0);
  const calibStartedRef = useRef(0);
  const confidenceSumRef = useRef(0);
  const confidenceCountRef = useRef(0);
  const lastTsRef = useRef(0);
  const visibleRef = useRef(true);
  const startGenRef = useRef(0);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const gazeRef = useRef(createGazeHoldTracker(GAZE_OPTS));
  const nearFarRef = useRef(createNearFarTracker(NEAR_FAR_OPTS));
  const sitStandRef = useRef(createSitStandTracker(SIT_STAND_OPTS));

  const showSession =
    phase === "privacy" ||
    phase === "calibrating" ||
    phase === "active" ||
    phase === "saving";

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      visibleRef.current = document.visibilityState === "visible";
    };
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    return () => {
      startGenRef.current += 1;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      engineRef.current?.close();
      engineRef.current = null;
    };
  }, []);

  function stopLoop() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }

  function stopCameraAndEngine() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    engineRef.current?.close();
    engineRef.current = null;
  }

  function currentReps(): number {
    const m = modeRef.current;
    if (m === "face_gaze_hold") return gazeRef.current.reps;
    if (m === "face_near_far") return nearFarRef.current.reps;
    if (m === "pose_habituation") return sitStandRef.current.reps;
    return 0;
  }

  function tick(now: number) {
    rafRef.current = requestAnimationFrame(tick);

    const video = videoRef.current;
    const engine = engineRef.current;
    if (!video || !engine) return;
    if (!visibleRef.current) return;
    if (video.readyState < 2) return;

    const ts = Math.max(now, lastTsRef.current + 1);
    lastTsRef.current = ts;

    const m = modeRef.current;
    const currentPhase = phaseRef.current;

    if (usesFace(m)) {
      const face = (engine as FaceEngine).detect(video, ts);
      if (!face) {
        setStatus("hard_to_see");
        setStatusDetail("Keep your face clearly in view.");
        return;
      }

      confidenceSumRef.current += face.confidence;
      confidenceCountRef.current += 1;

      if (currentPhase === "calibrating") {
        if (m === "face_gaze_hold") {
          gazeRef.current.addCalibrationSample({
            irisMid: face.irisMid,
            headYaw: face.headYaw,
            confidence: face.confidence,
          });
        } else {
          nearFarRef.current.addBaselineSample({
            faceScale: face.faceScale,
            confidence: face.confidence,
          });
        }
        const pct = Math.min(
          100,
          Math.round(((now - calibStartedRef.current) / CALIB_MS) * 100),
        );
        setCalibProgress(pct);
        setStatus("tracking_well");
        setStatusDetail(
          m === "face_gaze_hold"
            ? "Hold still — look at your target…"
            : "Hold a mid distance from the camera…",
        );
        if (now - calibStartedRef.current >= CALIB_MS) {
          const ok =
            m === "face_gaze_hold"
              ? gazeRef.current.finishCalibration()
              : nearFarRef.current.finishBaseline();
          if (ok) {
            startedAtRef.current = Date.now();
            setPhase("active");
            setCalibProgress(100);
            setStatusDetail(
              m === "face_gaze_hold"
                ? "Turn your head slowly; keep eyes on the target."
                : "Switch slowly between near and far focus.",
            );
          } else {
            calibStartedRef.current = now;
            setCalibProgress(0);
            setStatus("hard_to_see");
            setStatusDetail("Couldn’t calibrate — face the camera and retry.");
          }
        }
        return;
      }

      if (m === "face_gaze_hold") {
        const result = gazeRef.current.update({
          irisMid: face.irisMid,
          headYaw: face.headYaw,
          confidence: face.confidence,
        });
        setReps(gazeRef.current.reps);
        if (result === "low_confidence") {
          setStatus("hard_to_see");
          setStatusDetail("Hard to see your eyes clearly.");
        } else if (result === "gaze_drift") {
          setStatus("hard_to_see");
          setStatusDetail("Eyes drifted from the target — look back at it.");
        } else {
          setStatus("tracking_well");
          setStatusDetail(null);
        }
        return;
      }

      const nf = nearFarRef.current.update({
        faceScale: face.faceScale,
        confidence: face.confidence,
      });
      setReps(nearFarRef.current.reps);
      if (nf === "low_confidence" || nf === "need_baseline") {
        setStatus("hard_to_see");
        setStatusDetail("Hard to see your face clearly.");
      } else {
        setStatus("tracking_well");
        setStatusDetail(null);
      }
      return;
    }

    // Pose modes
    const pose = (engine as PoseEngine).detect(video, ts);
    if (!pose) {
      setStatus("hard_to_see");
      setStatusDetail("Move a bit closer or improve lighting.");
      return;
    }

    confidenceSumRef.current += pose.confidence;
    confidenceCountRef.current += 1;

    const lm = pose.landmarks;
    const leftShoulder = lm[LEFT_SHOULDER];
    const rightShoulder = lm[RIGHT_SHOULDER];
    const leftHip = lm[LEFT_HIP];
    const rightHip = lm[RIGHT_HIP];
    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
      setStatus("hard_to_see");
      setStatusDetail("Hard to see your torso clearly.");
      return;
    }

    if (m === "pose_habituation") {
      const torsoY =
        (leftShoulder.y + rightShoulder.y + leftHip.y + rightHip.y) / 4;
      const conf = Math.min(
        leftShoulder.visibility ?? 1,
        rightShoulder.visibility ?? 1,
        leftHip.visibility ?? 1,
        rightHip.visibility ?? 1,
      );
      sitStandRef.current.update({ torsoY, confidence: conf });
      setReps(sitStandRef.current.reps);
      if (conf < SIT_STAND_OPTS.minConfidence) {
        setStatus("hard_to_see");
        setStatusDetail("Hard to see your torso clearly.");
      } else {
        setStatus("tracking_well");
        setStatusDetail(null);
      }
      return;
    }

    const presence = checkBalancePresence({
      leftShoulder,
      rightShoulder,
      leftHip,
      rightHip,
    });
    if (!presence.ok) {
      setStatus("hard_to_see");
      setStatusDetail(
        presence.reason === "out_of_frame"
          ? "Stay centered in the frame."
          : "Hard to see your torso clearly.",
      );
    } else {
      setStatus("tracking_well");
      setStatusDetail(null);
    }
  }

  async function startPractice() {
    const gen = ++startGenRef.current;
    setStartError(null);
    setStarting(true);
    setStatus("idle");
    setStatusDetail(null);
    setReps(0);
    setElapsed(0);
    setCalibProgress(0);
    confidenceSumRef.current = 0;
    confidenceCountRef.current = 0;
    lastTsRef.current = 0;
    gazeRef.current = createGazeHoldTracker(GAZE_OPTS);
    nearFarRef.current = createNearFarTracker(NEAR_FAR_OPTS);
    sitStandRef.current = createSitStandTracker(SIT_STAND_OPTS);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API is not available in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      if (gen !== startGenRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        throw new Error("Video element missing.");
      }
      video.srcObject = stream;
      await video.play().catch(() => {});

      if (gen !== startGenRef.current) {
        stopCameraAndEngine();
        return;
      }

      const engine = usesFace(mode)
        ? await createFaceEngine()
        : await createPoseEngine();

      if (gen !== startGenRef.current) {
        engine.close();
        stopCameraAndEngine();
        return;
      }

      engineRef.current = engine;

      if (needsCalibration(mode)) {
        calibStartedRef.current = performance.now();
        setPhase("calibrating");
        setStatus("tracking_well");
        setStatusDetail(
          mode === "face_gaze_hold"
            ? "Look at your target and hold still…"
            : "Sit at a mid distance for a moment…",
        );
      } else {
        startedAtRef.current = Date.now();
        setPhase("active");
        setStatus("hard_to_see");
        setStatusDetail("Finding you in the frame…");
      }
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      if (gen !== startGenRef.current) return;
      stopCameraAndEngine();
      setStatus("camera_unavailable");
      setStatusDetail(
        "Permission denied or no camera found. You can still log practice manually below.",
      );
      setStartError(
        "Camera unavailable. Check permissions, then try again — or use manual log.",
      );
      setPhase("privacy");
    } finally {
      if (gen === startGenRef.current) setStarting(false);
    }
  }

  async function endPractice() {
    if (saving || phase === "saving") return;
    if (phase !== "active" && phase !== "calibrating") return;

    stopLoop();

    const durationSeconds = Math.max(
      0,
      Math.round(
        (Date.now() -
          (startedAtRef.current || Date.now())) /
          1000,
      ),
    );
    setElapsed(durationSeconds);

    const confCount = confidenceCountRef.current;
    const confAvg =
      confCount > 0 ? confidenceSumRef.current / confCount : null;
    const repCount = countsReps(mode) ? currentReps() : null;

    stopCameraAndEngine();
    setPhase("saving");
    setSaving(true);
    setActionState(initialAction);

    const fd = new FormData();
    fd.set("exercise_id", exerciseId);
    fd.set("duration_seconds", String(durationSeconds));
    if (repCount != null) fd.set("rep_count", String(repCount));
    if (confAvg != null) fd.set("cv_confidence_avg", confAvg.toFixed(3));

    try {
      const result = await saveCameraPracticeSession(fd);
      setActionState(result);
      setPhase("collapsed");
      setStatus("idle");
      setStatusDetail(null);
      setElapsed(0);
      setReps(0);
      setCalibProgress(0);
    } catch {
      setActionState({
        ok: false,
        error: "Could not save practice. Try again or log manually below.",
      });
      setPhase("collapsed");
    } finally {
      setSaving(false);
    }
  }

  const transitionClass = reducedMotion
    ? ""
    : "transition-opacity duration-200";
  const copy = cvModeCopy(mode);

  if (phase === "collapsed") {
    return (
      <div
        className={`rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-5 py-5 ${transitionClass}`}
      >
        <p className="text-sm text-[var(--stasus-ink-muted)]">{copy}</p>
        {actionState.ok ? (
          <p className="mt-2 text-sm text-[var(--stasus-ink-muted)]">
            Practice saved. Nice work showing up.
          </p>
        ) : null}
        {actionState.error ? (
          <p
            role="alert"
            className="mt-2 text-sm text-red-700 dark:text-red-300"
          >
            {actionState.error}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setStartError(null);
            setPhase("privacy");
          }}
          className="mt-4 inline-flex h-11 w-fit items-center justify-center rounded-full bg-[var(--stasus-teal)] px-5 text-sm font-semibold text-white dark:bg-[var(--stasus-aqua)] dark:text-[#001219]"
        >
          Practice with camera
        </button>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-5 py-5 ${transitionClass}`}
    >
      <h2 className="text-lg font-semibold text-[var(--stasus-ink)]">
        Practice with camera
      </h2>
      <p className="mt-2 text-sm text-[var(--stasus-ink-muted)]">{copy}</p>

      {phase === "privacy" ? (
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-sm text-[var(--stasus-ink)]">
            Camera stays on this device. Only timing, optional reps, and
            tracking confidence are saved — never video.
          </p>
          {startError ? (
            <p role="alert" className="text-sm text-red-700 dark:text-red-300">
              {startError}
            </p>
          ) : null}
          <TrackingStatus status={status} detail={statusDetail} />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={starting}
              onClick={() => void startPractice()}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--stasus-teal)] px-5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-[var(--stasus-aqua)] dark:text-[#001219]"
            >
              {starting ? "Starting…" : "Start"}
            </button>
            <button
              type="button"
              disabled={starting}
              onClick={() => {
                setPhase("collapsed");
                setStatus("idle");
                setStatusDetail(null);
                setStartError(null);
              }}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--stasus-border)] px-5 text-sm font-semibold text-[var(--stasus-ink)] disabled:opacity-60"
            >
              Not now
            </button>
          </div>
        </div>
      ) : null}

      {showSession ? (
        <div
          className={
            phase === "privacy" ? "sr-only" : "mt-4 flex flex-col gap-4"
          }
          aria-hidden={phase === "privacy"}
        >
          <CameraViewport
            videoRef={videoRef}
            showSilhouette={
              phase === "active" ||
              phase === "calibrating" ||
              phase === "saving"
            }
          />
          {phase === "calibrating" ||
          phase === "active" ||
          phase === "saving" ? (
            <>
              <TrackingStatus status={status} detail={statusDetail} />
              {phase === "calibrating" ? (
                <p className="text-sm text-[var(--stasus-ink-muted)]">
                  Calibrating… {calibProgress}%
                </p>
              ) : null}
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--stasus-ink)]">
                <p>
                  Time:{" "}
                  <span className="font-medium">
                    <LiveElapsed
                      startedAt={startedAtRef.current}
                      running={phase === "active"}
                      frozenSeconds={elapsed}
                      onSeconds={setElapsed}
                    />
                  </span>
                </p>
                {countsReps(mode) && phase !== "calibrating" ? (
                  <p>
                    {repLabel(mode)}:{" "}
                    <span className="font-medium">{reps}</span>
                  </p>
                ) : null}
              </div>
              <p className="text-sm text-[var(--stasus-ink-muted)]">
                This is practice support only — not a diagnosis or form score.
              </p>
              <button
                type="button"
                disabled={phase === "saving" || saving || phase === "calibrating"}
                onClick={() => void endPractice()}
                className="inline-flex h-11 w-fit items-center justify-center rounded-full bg-[var(--stasus-teal)] px-5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-[var(--stasus-aqua)] dark:text-[#001219]"
              >
                {phase === "saving" || saving ? "Saving…" : "End practice"}
              </button>
              {actionState.error ? (
                <p
                  role="alert"
                  className="text-sm text-red-700 dark:text-red-300"
                >
                  {actionState.error}
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function LiveElapsed({
  startedAt,
  running,
  frozenSeconds,
  onSeconds,
}: {
  startedAt: number;
  running: boolean;
  frozenSeconds: number;
  onSeconds: (n: number) => void;
}) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!running || !startedAt) {
      setSeconds(frozenSeconds);
      return;
    }
    const update = () => {
      const sec = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
      setSeconds(sec);
      onSeconds(sec);
    };
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, [running, startedAt, frozenSeconds, onSeconds]);

  return <>{formatElapsed(seconds)}</>;
}
