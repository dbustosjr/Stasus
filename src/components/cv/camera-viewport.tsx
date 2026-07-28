"use client";

import type { RefObject } from "react";

type CameraViewportProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  /** Faint static framing guide — never animated landmarks. */
  showSilhouette?: boolean;
};

/**
 * Mirrored live preview. No bouncing CV overlays — calm framing only.
 */
export function CameraViewport({
  videoRef,
  showSilhouette = true,
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
      {showSilhouette ? (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <svg
            viewBox="0 0 200 260"
            className="h-[72%] w-auto opacity-[0.18] text-[var(--stasus-ink-muted)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="100" cy="48" r="28" />
            <path d="M100 76v52" />
            <path d="M58 110h84" />
            <path d="M100 128c-28 0-48 22-52 58v18h104v-18c-4-36-24-58-52-58z" />
          </svg>
        </div>
      ) : null}
    </div>
  );
}
