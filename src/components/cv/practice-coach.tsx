"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  logExerciseSession,
  type SessionFormState,
} from "@/app/actions/sessions";
import { CameraViewport } from "@/components/cv/camera-viewport";
import {
  TrackingStatus,
  type TrackingStatusKind,
} from "@/components/cv/tracking-status";
import { checkBalancePresence } from "@/lib/cv/pose/balance-presence";
import {
  createPoseEngine,
  type PoseEngine,
} from "@/lib/cv/pose/engine";
import {
  createHeadYawTracker,
  yawFromPoseLandmarks,
} from "@/lib/cv/pose/head-yaw";
import {
  LEFT_HIP,
  LEFT_SHOULDER,
  NOSE,
  RIGHT_HIP,
  RIGHT_SHOULDER,
} from "@/lib/cv/pose/landmarks";
import type { ExerciseCategory } from "@/lib/exercises/types";

const initialAction: SessionFormState = { error: null, ok: false };

const YAW_OPTS = {
  enterThreshold: 0.12,
  returnThreshold: 0.04,
  minConfidence: 0.6,
} as const;

const MIN_TRACK_CONFIDENCE = 0.6;

type Phase = "collapsed" | "privacy" | "active" | "saving";

type PracticeCoachProps = {
  exerciseId: string;
  category: ExerciseCategory;
};

function categoryCopy(category: ExerciseCategory): string {
  if (category === "gaze_stabilization") {
    return "Head movement check (pose). Eye tracking comes later.";
  }
  if (category === "balance_training") {
    return "Pose check — stay centered in frame with support nearby.";
  }
  return "Pose check — stay comfortably in frame. This is practice support, not a diagnosis.";
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * On-device pose practice coach. Camera frames never leave the browser;
 * only timing, optional reps, and average tracking confidence are saved.
 */
export function PracticeCoach({ exerciseId, category }: PracticeCoachProps) {
  const [phase, setPhase] = useState<Phase>("collapsed");
  const [status, setStatus] = useState<TrackingStatusKind>("idle");
  const [statusDetail, setStatusDetail] = useState<string | null>(null);
  const [reps, setReps] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [startError, setStartError] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [starting, setStarting] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const engineRef = useRef<PoseEngine | null>(null);
  const rafRef = useRef<number>(0);
  const startedAtRef = useRef<number>(0);
  const confidenceSumRef = useRef(0);
  const confidenceCountRef = useRef(0);
  const yawTrackerRef = useRef(createHeadYawTracker(YAW_OPTS));
  const lastTsRef = useRef(0);
  const visibleRef = useRef(true);
  const categoryRef = useRef(category);
  categoryRef.current = category;

  const [actionState, formAction, pending] = useActionState(
    logExerciseSession,
    initialAction,
  );

  const isGaze = category === "gaze_stabilization";
  const showSession = phase === "privacy" || phase === "active" || phase === "saving";

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
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      engineRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (phase !== "saving" || pending) return;
    // Action finished (ok or error) — return to collapsed; message shows there.
    if (actionState.ok || actionState.error) {
      setPhase("collapsed");
      setStatus("idle");
      setStatusDetail(null);
      setElapsed(0);
      setReps(0);
    }
  }, [actionState.ok, actionState.error, phase, pending]);

  function stopLoop() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }

  function stopCameraAndEngine() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    engineRef.current?.close();
    engineRef.current = null;
  }

  function tick(now: number) {
    rafRef.current = requestAnimationFrame(tick);

    const video = videoRef.current;
    const engine = engineRef.current;
    if (!video || !engine) return;
    if (!visibleRef.current) return;
    if (video.readyState < 2) return;

    // MediaPipe requires strictly increasing timestamps.
    const ts = Math.max(now, lastTsRef.current + 1);
    lastTsRef.current = ts;

    const detection = engine.detect(video, ts);
    if (!detection) {
      setStatus("hard_to_see");
      setStatusDetail("Move a bit closer or improve lighting.");
      return;
    }

    confidenceSumRef.current += detection.confidence;
    confidenceCountRef.current += 1;

    const lm = detection.landmarks;
    const cat = categoryRef.current;

    if (cat === "gaze_stabilization") {
      const sample = yawFromPoseLandmarks({
        nose: lm[NOSE] ?? { x: 0.5 },
        leftShoulder: lm[LEFT_SHOULDER] ?? { x: 0.4 },
        rightShoulder: lm[RIGHT_SHOULDER] ?? { x: 0.6 },
      });
      yawTrackerRef.current.update(sample);
      setReps(yawTrackerRef.current.reps);

      if (sample.confidence < MIN_TRACK_CONFIDENCE) {
        setStatus("hard_to_see");
        setStatusDetail("Hard to see your head and shoulders clearly.");
      } else {
        setStatus("tracking_well");
        setStatusDetail(null);
      }
      return;
    }

    const presence = checkBalancePresence({
      leftShoulder: lm[LEFT_SHOULDER] ?? { x: 0, y: 0 },
      rightShoulder: lm[RIGHT_SHOULDER] ?? { x: 0, y: 0 },
      leftHip: lm[LEFT_HIP] ?? { x: 0, y: 0 },
      rightHip: lm[RIGHT_HIP] ?? { x: 0, y: 0 },
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
    setStartError(null);
    setStarting(true);
    setStatus("idle");
    setStatusDetail(null);
    setReps(0);
    setElapsed(0);
    confidenceSumRef.current = 0;
    confidenceCountRef.current = 0;
    yawTrackerRef.current = createHeadYawTracker(YAW_OPTS);
    lastTsRef.current = 0;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API is not available in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        throw new Error("Video element missing.");
      }
      video.srcObject = stream;
      await video.play().catch(() => {
        /* autoplay may reject; stream still attached */
      });

      const engine = await createPoseEngine();
      engineRef.current = engine;

      startedAtRef.current = Date.now();
      setPhase("active");
      setStatus("hard_to_see");
      setStatusDetail("Finding you in the frame…");
      rafRef.current = requestAnimationFrame(tick);
    } catch {
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
      setStarting(false);
    }
  }

  function endPractice() {
    stopLoop();

    const durationSeconds = Math.max(
      0,
      Math.round((Date.now() - startedAtRef.current) / 1000),
    );
    setElapsed(durationSeconds);

    const confCount = confidenceCountRef.current;
    const confAvg =
      confCount > 0 ? confidenceSumRef.current / confCount : null;
    const repCount = isGaze ? yawTrackerRef.current.reps : null;

    stopCameraAndEngine();
    setPhase("saving");

    const fd = new FormData();
    fd.set("exercise_id", exerciseId);
    fd.set("duration_seconds", String(durationSeconds));
    if (repCount != null) {
      fd.set("rep_count", String(repCount));
    }
    if (confAvg != null) {
      fd.set("cv_confidence_avg", confAvg.toFixed(4));
    }
    formAction(fd);
  }

  const transitionClass = reducedMotion
    ? ""
    : "transition-opacity duration-200";

  if (phase === "collapsed") {
    return (
      <div
        className={`rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-5 py-5 ${transitionClass}`}
      >
        <p className="text-sm text-[var(--stasus-ink-muted)]">
          {categoryCopy(category)}
        </p>
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
      <p className="mt-2 text-sm text-[var(--stasus-ink-muted)]">
        {categoryCopy(category)}
      </p>

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

      {/* Single viewport instance so stream stays attached across Start → active */}
      {showSession ? (
        <div
          className={
            phase === "privacy" ? "sr-only" : "mt-4 flex flex-col gap-4"
          }
          aria-hidden={phase === "privacy"}
        >
          <CameraViewport
            videoRef={videoRef}
            showSilhouette={phase === "active" || phase === "saving"}
          />
          {phase === "active" || phase === "saving" ? (
            <>
              <TrackingStatus status={status} detail={statusDetail} />
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
                {isGaze ? (
                  <p>
                    Head turns counted:{" "}
                    <span className="font-medium">{reps}</span>
                  </p>
                ) : null}
              </div>
              <p className="text-sm text-[var(--stasus-ink-muted)]">
                This is practice support only — not a diagnosis or form score.
              </p>
              <button
                type="button"
                disabled={phase === "saving" || pending}
                onClick={endPractice}
                className="inline-flex h-11 w-fit items-center justify-center rounded-full bg-[var(--stasus-teal)] px-5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-[var(--stasus-aqua)] dark:text-[#001219]"
              >
                {phase === "saving" || pending ? "Saving…" : "End practice"}
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
