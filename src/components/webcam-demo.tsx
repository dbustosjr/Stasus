"use client";

import { useRef, useState } from "react";

type WebcamDemoProps = {
  /** Compact card for the hero; full-width 16:9 for the demo section. */
  variant?: "hero" | "full";
};

/**
 * Motion-safe product demo — click to play, no autoplay.
 */
export function WebcamDemo({ variant = "full" }: WebcamDemoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const isHero = variant === "hero";

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
    <div className={isHero ? "flex flex-col gap-3" : undefined}>
      <div
        className={`relative overflow-hidden rounded-2xl border border-[var(--stasus-border)] bg-[#001219] ${
          isHero
            ? "shadow-[0_20px_60px_-36px_rgba(0,0,0,0.7)]"
            : "shadow-[0_24px_80px_-40px_rgba(0,0,0,0.65)]"
        }`}
      >
        <video
          ref={videoRef}
          className="aspect-video w-full object-cover bg-[#001219]"
          playsInline
          preload="metadata"
          controls={playing}
          poster="/demo/webcam-practice-poster.png"
          aria-label="Demo of optional webcam practice for head-movement checks"
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
            className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-3 bg-[color-mix(in_srgb,#001219_32%,transparent)] transition-colors hover:bg-[color-mix(in_srgb,#001219_44%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[var(--stasus-aqua)]"
            aria-label={
              isHero
                ? "Play 8-second webcam practice demo"
                : "Play webcam practice demo"
            }
          >
            <span
              className={`inline-flex items-center justify-center rounded-full bg-white text-[#014152] shadow-lg transition-transform hover:scale-[1.04] active:scale-[0.98] ${
                isHero ? "h-14 w-14" : "h-16 w-16"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className={`ml-0.5 ${isHero ? "h-6 w-6" : "h-7 w-7"}`}
                aria-hidden
                fill="currentColor"
              >
                <path d="M8 5.14v13.72a1 1 0 0 0 1.55.83l10.12-6.86a1 1 0 0 0 0-1.66L9.55 4.31A1 1 0 0 0 8 5.14Z" />
              </svg>
            </span>
            <span className="rounded-full border border-[color-mix(in_srgb,white_35%,transparent)] bg-[color-mix(in_srgb,#001219_55%,transparent)] px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              {isHero ? "See the 8-second demo" : "Click to play · about 8 seconds"}
            </span>
          </button>
        ) : null}
      </div>
      {isHero ? (
        <p className="text-center text-xs leading-relaxed text-[color-mix(in_srgb,white_72%,transparent)] sm:text-left">
          Nothing recorded · camera stays off until you start
        </p>
      ) : null}
    </div>
  );
}
