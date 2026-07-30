"use client";

import { useRef, useState } from "react";

/**
 * Motion-safe product demo — click to play, no autoplay.
 */
export function WebcamDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  async function play() {
    const el = videoRef.current;
    if (!el) return;
    try {
      await el.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  function onEnded() {
    setPlaying(false);
    const el = videoRef.current;
    if (el) el.currentTime = 0;
  }

  function onPause() {
    const el = videoRef.current;
    if (el && el.paused && !el.ended) setPlaying(false);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] shadow-[0_24px_80px_-40px_rgba(0,0,0,0.65)]">
      <video
        ref={videoRef}
        className="aspect-video w-full bg-[#001219]"
        playsInline
        preload="metadata"
        controls={playing}
        poster="/demo/webcam-practice-poster.png"
        onEnded={onEnded}
        onPause={onPause}
        onPlay={() => setPlaying(true)}
      >
        <source src="/demo/webcam-practice.mp4" type="video/mp4" />
      </video>

      {!playing ? (
        <button
          type="button"
          onClick={play}
          className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-4 bg-[color-mix(in_srgb,#001219_32%,transparent)] transition-colors hover:bg-[color-mix(in_srgb,#001219_44%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[var(--stasus-aqua)]"
          aria-label="Play webcam practice demo"
        >
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#014152] shadow-lg transition-transform hover:scale-[1.04] active:scale-[0.98]">
            <svg
              viewBox="0 0 24 24"
              className="ml-1 h-7 w-7"
              aria-hidden
              fill="currentColor"
            >
              <path d="M8 5.14v13.72a1 1 0 0 0 1.55.83l10.12-6.86a1 1 0 0 0 0-1.66L9.55 4.31A1 1 0 0 0 8 5.14Z" />
            </svg>
          </span>
          <span className="rounded-full border border-[color-mix(in_srgb,white_35%,transparent)] bg-[color-mix(in_srgb,#001219_55%,transparent)] px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            Click to play · about 8 seconds
          </span>
        </button>
      ) : null}
    </div>
  );
}
