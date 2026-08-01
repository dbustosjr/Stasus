"use client";

import { useRef, useState } from "react";

type WebcamDemoProps = {
  /** Compact card for the hero; full-width 16:9 for the demo section. */
  variant?: "hero" | "full";
  src?: string;
  poster?: string;
  ariaLabel?: string;
  playLabel?: string;
  /** Hero caption under the player; pass `null` to hide. */
  caption?: string | null;
  /** Frame shape. Symptom-tracker capture is portrait. */
  aspect?: "video" | "portrait";
};

/**
 * Motion-safe product demo — click to play, no autoplay.
 */
export function WebcamDemo({
  variant = "full",
  src = "/demo/webcam-practice.mp4",
  poster = "/demo/webcam-practice-poster.png",
  ariaLabel = "Demo of optional webcam practice for head-movement checks",
  playLabel,
  caption,
  aspect = "video",
}: WebcamDemoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const isHero = variant === "hero";
  const resolvedPlayLabel =
    playLabel ??
    (isHero ? "See the 8-second demo" : "Click to play · about 8 seconds");
  const resolvedCaption =
    caption === undefined
      ? isHero
        ? "Nothing recorded · camera stays off until you start"
        : null
      : caption;
  const frameAspect =
    aspect === "portrait"
      ? "aspect-[3/4] max-h-[min(32rem,70vh)] w-full object-cover bg-[#001219] mx-auto"
      : "aspect-video w-full object-cover bg-[#001219]";

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
          className={frameAspect}
          playsInline
          preload="metadata"
          controls={playing}
          poster={poster}
          aria-label={ariaLabel}
          onEnded={onEnded}
          onPause={onPause}
          onPlay={() => setPlaying(true)}
        >
          <source src={src} type="video/mp4" />
        </video>

        {!playing ? (
          <button
            type="button"
            onClick={play}
            className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-3 bg-[color-mix(in_srgb,#001219_32%,transparent)] transition-colors hover:bg-[color-mix(in_srgb,#001219_44%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[var(--stasus-aqua)]"
            aria-label={resolvedPlayLabel}
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
              {resolvedPlayLabel}
            </span>
          </button>
        ) : null}
      </div>
      {resolvedCaption ? (
        <p className="text-center text-xs leading-relaxed text-[color-mix(in_srgb,white_72%,transparent)] sm:text-left">
          {resolvedCaption}
        </p>
      ) : null}
    </div>
  );
}
