"use client";

import Link from "next/link";
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
  cameraPracticeModeCopy,
  cvModeCopy,
  guideForMode,
  resolveCvTrackMode,
  supportsFormFeedback,
  type CameraPracticeMode,
  type CvTrackMode,
} from "@/lib/cv/track-mode";
import type { ExerciseCategory } from "@/lib/exercises/types";

const initialAction: SessionFormState = { error: null, ok: false };

const GAZE_OPTS = {
  irisTolerance: 0.09,
  yawEnter: 0.055,
  minConfidence: 0.5,
} as const;

const SIT_STAND_OPTS = {
  riseEnter: 0.035,
  settleBand: 0.03,
  minConfidence: 0.5,
} as const;

const CALIB_MS = 2000;

type Phase = "collapsed" | "privacy" | "calibrating" | "active" | "saving";
type AnyEngine = PoseEngine | FaceEngine;

type PracticeCoachProps = {
  exerciseId: string;
  category: ExerciseCategory;
  title: string;
  /** Full practice page: larger camera, starts at privacy consent. */
  variant?: "inline" | "page";
  /** Shown after a page session ends. */
  backHref?: string;
};

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function needsCalibration(mode: CvTrackMode): boolean {
  return mode === "face_gaze_hold";
}

function usesFace(mode: CvTrackMode): boolean {
  return (
    mode === "face_gaze_hold" ||
    mode === "face_near_far" ||
    mode === "face_presence"
  );
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
      return "Switches counted";
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
  variant = "inline",
  backHref,
}: PracticeCoachProps) {
  const isPage = variant === "page";
  const mode =
    resolveCvTrackMode(category, title) ??
    (category === "balance_training" ? "pose_balance" : "face_presence");

  const [phase, setPhase] = useState<Phase>(isPage ? "privacy" : "collapsed");
  const [practiceMode, setPracticeMode] = useState<CameraPracticeMode | null>(
    null,
  );
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
  const formFeedbackAvailable = supportsFormFeedback(mode);

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
  const practiceModeRef = useRef<CameraPracticeMode | null>(null);
  practiceModeRef.current = practiceMode;
  const manualRepsRef = useRef(0);

  const gazeRef = useRef(createGazeHoldTracker(GAZE_OPTS));
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
    if (practiceModeRef.current === "preview") {
      return manualRepsRef.current;
    }
    const m = modeRef.current;
    if (m === "face_gaze_hold") return gazeRef.current.reps;
    if (m === "face_near_far") return manualRepsRef.current;
    if (m === "pose_habituation") return sitStandRef.current.reps;
    return 0;
  }

  function tick(now: number) {
    rafRef.current = requestAnimationFrame(tick);

    if (practiceModeRef.current === "preview") return;

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

      const nose = face.landmarks[1];
      if (!nose) {
        setStatus("hard_to_see");
        setStatusDetail("Keep your face clearly in view.");
        return;
      }

      if (currentPhase === "calibrating" && m === "face_gaze_hold") {
        gazeRef.current.addCalibrationSample({
          irisMid: face.irisMid,
          faceAnchor: { x: nose.x, y: nose.y },
          headYaw: face.headYaw,
          confidence: face.confidence,
        });
        const pct = Math.min(
          100,
          Math.round(((now - calibStartedRef.current) / CALIB_MS) * 100),
        );
        setCalibProgress(pct);
        setStatus("tracking_well");
        setStatusDetail("Hold still — look at your target…");
        if (now - calibStartedRef.current >= CALIB_MS) {
          if (gazeRef.current.finishCalibration()) {
            startedAtRef.current = Date.now();
            setPhase("active");
            setCalibProgress(100);
            setStatusDetail(
              "Turn your head slowly; keep eyes on the target.",
            );
          } else {
            calibStartedRef.current = now;
            setCalibProgress(0);
            setStatus("hard_to_see");
            setStatusDetail("Couldn’t calibrate — face the camera and hold still.");
          }
        }
        return;
      }

      if (m === "face_gaze_hold") {
        const result = gazeRef.current.update({
          irisMid: face.irisMid,
          faceAnchor: { x: nose.x, y: nose.y },
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

      // face_near_far + face_presence: presence only
      setStatus("tracking_well");
      setStatusDetail(
        m === "face_near_far"
          ? "Face in view — tap Count switch after each near↔far cycle."
          : null,
      );
      return;
    }

    const pose = (engine as PoseEngine).detect(video, ts);
    if (!pose) {
      setStatus("hard_to_see");
      setStatusDetail("Step back so more of your torso is visible.");
      return;
    }

    confidenceSumRef.current += pose.confidence;
    confidenceCountRef.current += 1;

    const lm = pose.landmarks;
    const leftShoulder = lm[LEFT_SHOULDER];
    const rightShoulder = lm[RIGHT_SHOULDER];
    const leftHip = lm[LEFT_HIP];
    const rightHip = lm[RIGHT_HIP];
    if (!leftShoulder || !rightShoulder) {
      setStatus("hard_to_see");
      setStatusDetail("Hard to see your shoulders — step back a little.");
      return;
    }

    if (m === "pose_habituation") {
      const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const conf = Math.min(
        leftShoulder.visibility ?? 1,
        rightShoulder.visibility ?? 1,
      );
      sitStandRef.current.update({ shoulderY, confidence: conf });
      setReps(sitStandRef.current.reps);
      if (conf < SIT_STAND_OPTS.minConfidence) {
        setStatus("hard_to_see");
        setStatusDetail("Hard to see your shoulders clearly.");
      } else {
        setStatus("tracking_well");
        setStatusDetail(null);
      }
      return;
    }

    if (!leftHip || !rightHip) {
      setStatus("hard_to_see");
      setStatusDetail("Step back so hips and shoulders are in frame.");
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
          ? "Stay centered — step back if needed."
          : "Hard to see your torso clearly.",
      );
    } else {
      setStatus("tracking_well");
      setStatusDetail(null);
    }
  }

  function resetConsentErrors() {
    setStartError(null);
    setStatus("idle");
    setStatusDetail(null);
  }

  async function startPractice(chosen: CameraPracticeMode) {
    if (chosen === "feedback" && !formFeedbackAvailable) return;

    const gen = ++startGenRef.current;
    setPracticeMode(chosen);
    practiceModeRef.current = chosen;
    resetConsentErrors();
    setStarting(true);
    setReps(0);
    setElapsed(0);
    setCalibProgress(0);
    confidenceSumRef.current = 0;
    confidenceCountRef.current = 0;
    lastTsRef.current = 0;
    manualRepsRef.current = 0;
    gazeRef.current = createGazeHoldTracker(GAZE_OPTS);
    sitStandRef.current = createSitStandTracker(SIT_STAND_OPTS);

    let cameraOpened = false;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw Object.assign(new Error("Camera API is not available."), {
          name: "NotSupportedError",
        });
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      cameraOpened = true;

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

      // Preview: camera mirror + timer only. No pose/gaze scoring.
      if (chosen === "preview") {
        startedAtRef.current = Date.now();
        setPhase("active");
        setStatus("tracking_well");
        setStatusDetail("Camera on this device only. Count at your own pace.");
        return;
      }

      // Feedback path: camera already works; load on-device models separately.
      let engine: AnyEngine;
      try {
        engine = usesFace(mode)
          ? await createFaceEngine()
          : await createPoseEngine();
      } catch (engineErr) {
        if (gen !== startGenRef.current) return;
        stopCameraAndEngine();
        setPracticeMode(null);
        practiceModeRef.current = null;
        setPhase("privacy");
        setStatus("idle");
        setStatusDetail(null);
        const detail =
          engineErr instanceof Error && engineErr.message
            ? engineErr.message.slice(0, 160)
            : "";
        setStartError(
          detail
            ? `Practice feedback could not load (${detail}). Your camera is fine — try “Start without feedback,” or log manually.`
            : "Practice feedback could not load on this device. Your camera is fine — use “Start without feedback,” or log the session manually.",
        );
        return;
      }

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
        setStatusDetail("Look at your target and hold still…");
      } else {
        startedAtRef.current = Date.now();
        setPhase("active");
        setStatus("hard_to_see");
        setStatusDetail("Finding you in the frame…");
      }
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      if (gen !== startGenRef.current) return;
      stopCameraAndEngine();
      setPracticeMode(null);
      practiceModeRef.current = null;
      setPhase("privacy");

      const name = err instanceof DOMException || err instanceof Error ? err.name : "";
      const permissionDenied =
        name === "NotAllowedError" ||
        name === "PermissionDeniedError" ||
        name === "SecurityError";

      if (permissionDenied) {
        setStatus("camera_unavailable");
        setStatusDetail(
          "The browser blocked the camera for this site. Allow camera access in your browser settings for this page, then try again — or log practice manually below.",
        );
        setStartError(
          "Camera permission is blocked in the browser for this site. That setting is in the browser (address bar / site settings), not in the Stasus Account menu.",
        );
      } else if (cameraOpened || chosen === "feedback") {
        setStatus("idle");
        setStatusDetail(null);
        setStartError(
          "Could not finish starting practice feedback. Try “Start without feedback,” or log the session manually.",
        );
      } else {
        setStatus("camera_unavailable");
        setStatusDetail(
          "No camera found, or it could not be opened. Try another browser or device, or log practice manually below.",
        );
        setStartError(
          "Could not open a camera on this device. You can still log practice manually below.",
        );
      }
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
        (Date.now() - (startedAtRef.current || Date.now())) / 1000,
      ),
    );
    setElapsed(durationSeconds);

    const isFeedback = practiceModeRef.current === "feedback";
    const confCount = confidenceCountRef.current;
    const confAvg =
      isFeedback && confCount > 0
        ? confidenceSumRef.current / confCount
        : null;
    const repCount =
      practiceModeRef.current === "preview" || countsReps(mode)
        ? currentReps()
        : null;

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
      setPracticeMode(null);
      practiceModeRef.current = null;
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
  const copy =
    practiceMode != null
      ? cameraPracticeModeCopy(mode, practiceMode)
      : formFeedbackAvailable
        ? `${cvModeCopy(mode)} You can choose feedback or a simple camera mirror.`
        : `${cvModeCopy(mode)} Camera practice here is a mirror and timer only — no form scoring.`;
  const guide =
    practiceMode === "preview" ? "none" : guideForMode(mode);
  const showManualCount =
    phase === "active" &&
    (practiceMode === "preview" || mode === "face_near_far");

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
        {isPage ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setActionState(initialAction);
                setPracticeMode(null);
                resetConsentErrors();
                setPhase("privacy");
              }}
              className="inline-flex h-11 w-fit cursor-pointer items-center justify-center rounded-full bg-[var(--stasus-teal)] px-5 text-sm font-semibold text-white transition-colors hover:opacity-90 active:scale-[0.98] dark:bg-[var(--stasus-aqua)] dark:text-[#001219]"
            >
              Practice again
            </button>
            {backHref ? (
              <Link
                href={backHref}
                className="inline-flex h-11 w-fit items-center justify-center rounded-full border border-[var(--stasus-border)] px-5 text-sm font-semibold text-[var(--stasus-ink)]"
              >
                Back to exercise
              </Link>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setPracticeMode(null);
              resetConsentErrors();
              setPhase("privacy");
            }}
            className="mt-4 inline-flex h-11 w-fit cursor-pointer items-center justify-center rounded-full bg-[var(--stasus-teal)] px-5 text-sm font-semibold text-white transition-colors hover:opacity-90 active:scale-[0.98] dark:bg-[var(--stasus-aqua)] dark:text-[#001219]"
          >
            Practice with camera
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] ${
        isPage ? "px-4 py-5 sm:px-6 sm:py-6" : "px-5 py-5"
      } ${transitionClass}`}
    >
      <h2 className="text-lg font-semibold text-[var(--stasus-ink)]">
        Practice with camera
      </h2>
      <p className="mt-2 text-sm text-[var(--stasus-ink-muted)]">{copy}</p>

      {phase === "privacy" ? (
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-sm text-[var(--stasus-ink)]">
            The camera stays on this device. We never store video. Choose how
            you want to practice:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--stasus-ink-muted)]">
            {formFeedbackAvailable ? (
              <li>
                <span className="font-medium text-[var(--stasus-ink)]">
                  With practice feedback
                </span>{" "}
                — optional signals for this exercise (for example gaze hold or
                sit-to-stand cycles). Not a form grade, not medical clearance,
                and not a guarantee that you are doing the exercise correctly or
                safely.
              </li>
            ) : null}
            <li>
              <span className="font-medium text-[var(--stasus-ink)]">
                Camera without feedback
              </span>{" "}
              — see yourself and time the session; count reps yourself if you
              want. No form or correctness scoring.
            </li>
          </ul>
          {startError ? (
            <p role="alert" className="text-sm text-red-700 dark:text-red-300">
              {startError}
            </p>
          ) : null}
          {status === "camera_unavailable" ? (
            <TrackingStatus status={status} detail={statusDetail} />
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {formFeedbackAvailable ? (
              <button
                type="button"
                disabled={starting}
                onClick={() => void startPractice("feedback")}
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-[var(--stasus-teal)] px-5 text-sm font-semibold text-white transition-colors hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[var(--stasus-aqua)] dark:text-[#001219]"
              >
                {starting && practiceMode === "feedback"
                  ? "Starting…"
                  : "Start with feedback"}
              </button>
            ) : null}
            <button
              type="button"
              disabled={starting}
              onClick={() => void startPractice("preview")}
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-[var(--stasus-border)] bg-[var(--stasus-bg)] px-5 text-sm font-semibold text-[var(--stasus-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_16%,transparent)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {starting && practiceMode === "preview"
                ? "Starting…"
                : "Start without feedback"}
            </button>
            {isPage && backHref ? (
              <Link
                href={backHref}
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-[var(--stasus-border)] px-5 text-sm font-semibold text-[var(--stasus-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_16%,transparent)] active:scale-[0.98]"
              >
                Not now
              </Link>
            ) : (
              <button
                type="button"
                disabled={starting}
                onClick={() => {
                  setPhase("collapsed");
                  setPracticeMode(null);
                  setStatus("idle");
                  setStatusDetail(null);
                  setStartError(null);
                }}
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-[var(--stasus-border)] px-5 text-sm font-semibold text-[var(--stasus-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_16%,transparent)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Not now
              </button>
            )}
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
            size={isPage ? "stage" : "default"}
            guide={
              phase === "active" ||
              phase === "calibrating" ||
              phase === "saving"
                ? guide
                : "none"
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
                {(practiceMode === "preview" || countsReps(mode)) &&
                phase !== "calibrating" ? (
                  <p>
                    {practiceMode === "preview"
                      ? "Your count"
                      : repLabel(mode)}
                    : <span className="font-medium">{reps}</span>
                  </p>
                ) : null}
              </div>
              {showManualCount ? (
                <button
                  type="button"
                  onClick={() => {
                    manualRepsRef.current += 1;
                    setReps(manualRepsRef.current);
                  }}
                  className="inline-flex h-11 w-fit cursor-pointer items-center justify-center rounded-full border border-[var(--stasus-border)] px-5 text-sm font-semibold text-[var(--stasus-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_16%,transparent)] active:scale-[0.98]"
                >
                  {mode === "face_near_far" && practiceMode !== "preview"
                    ? "Count switch"
                    : "Count"}
                </button>
              ) : null}
              <p className="text-sm text-[var(--stasus-ink-muted)]">
                {practiceMode === "feedback"
                  ? "Practice feedback only. Not a diagnosis, form grade, or proof that the exercise is correct or safe for you. Stop if anything feels wrong."
                  : "Camera mirror and timer only. Not a diagnosis or form score. Stop if anything feels wrong."}
              </p>
              <button
                type="button"
                disabled={
                  phase === "saving" || saving || phase === "calibrating"
                }
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
