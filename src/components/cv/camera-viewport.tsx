"use client";

import type { RefObject } from "react";

type CameraViewportProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  /** Framing guide: face-close work vs standing/torso work. */
  guide?: "face" | "torso" | "none";
};

/**
 * Mirrored live preview. Soft framing guides only — no animated landmarks.
 */
export function CameraViewport({
  videoRef,
  guide = "face",
}: CameraViewportProps) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-mist)] dark:bg-[var(--stasus-bg)]">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="h-full w-full object-cover"
        style={{ transform: "scaleX(-1)" }}
        aria-label="Live camera preview"
      />
      {guide === "face" ? (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          {/* Oval head guide — sized to the frame, not a tall stick figure */}
          <div
            className="rounded-[50%] border-2 border-[var(--stasus-teal-secondary)] opacity-25 dark:border-[var(--stasus-aqua)]"
            style={{ width: "42%", height: "58%" }}
          />
        </div>
      ) : null}
      {guide === "torso" ? (
        <div
          className="pointer-events-none absolute inset-0 flex items-end justify-center pb-[6%]"
          aria-hidden
        >
          <svg
            viewBox="0 0 160 200"
            className="h-[78%] w-auto max-w-[55%] opacity-25 text-[var(--stasus-teal-secondary)] dark:text-[var(--stasus-aqua)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="80" cy="36" r="22" />
            <path d="M80 58v36" />
            <path d="M42 88h76" />
            <path d="M52 94c0 48 8 78 28 90M108 94c0 48-8 78-28 90" />
          </svg>
        </div>
      ) : null}
    </div>
  );
}
