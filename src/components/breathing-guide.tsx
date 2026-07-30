"use client";

import { useEffect, useState } from "react";
import { BREATHING } from "@/lib/calm/content";

type Phase = "inhale" | "exhale" | "rest";

/**
 * Motion-safe breathing guide: no pulsing visuals when reduced-motion is on.
 * Timers still advance so the tool remains usable.
 */
export function BreathingGuide() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("rest");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!running) return;

    let phaseLocal: Phase = "inhale";
    let left = BREATHING.inhaleSeconds;
    let cycleLocal = 1;
    setPhase("inhale");
    setSecondsLeft(left);
    setCycle(cycleLocal);

    const id = window.setInterval(() => {
      left -= 1;
      if (left > 0) {
        setSecondsLeft(left);
        return;
      }

      if (phaseLocal === "inhale") {
        phaseLocal = "exhale";
        left = BREATHING.exhaleSeconds;
        setPhase("exhale");
        setSecondsLeft(left);
        return;
      }

      if (cycleLocal >= BREATHING.cycles) {
        setRunning(false);
        setPhase("rest");
        setSecondsLeft(0);
        void import("@/app/actions/activity").then(({ recordActivityDay }) =>
          recordActivityDay("calm").catch(() => undefined),
        );
        return;
      }

      cycleLocal += 1;
      phaseLocal = "inhale";
      left = BREATHING.inhaleSeconds;
      setCycle(cycleLocal);
      setPhase("inhale");
      setSecondsLeft(left);
    }, 1000);

    return () => window.clearInterval(id);
  }, [running]);

  const label =
    phase === "inhale"
      ? "Breathe in"
      : phase === "exhale"
        ? "Breathe out"
        : "Ready when you are";

  return (
    <div className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-6 py-6">
      <p className="text-sm text-[var(--stasus-ink-muted)]">{BREATHING.note}</p>
      <div className="mt-6 flex flex-col items-center gap-4">
        <div
          className={`flex h-36 w-36 items-center justify-center rounded-full border border-[var(--stasus-border)] bg-[color-mix(in_srgb,var(--stasus-aqua)_18%,var(--stasus-surface))] ${
            !reducedMotion && running && phase === "inhale"
              ? "scale-105 transition-transform duration-1000 ease-out"
              : !reducedMotion && running && phase === "exhale"
                ? "scale-95 transition-transform duration-1000 ease-out"
                : ""
          }`}
          aria-live="polite"
        >
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--stasus-ink-muted)]">
              {label}
            </p>
            {running ? (
              <p className="mt-1 text-3xl font-bold text-[var(--stasus-ink)]">
                {secondsLeft}
              </p>
            ) : null}
          </div>
        </div>
        {running ? (
          <p className="text-sm text-[var(--stasus-ink-muted)]">
            Cycle {cycle} of {BREATHING.cycles}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setRunning((v) => !v)}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--stasus-teal)] px-5 text-sm font-semibold text-white dark:bg-[var(--stasus-aqua)] dark:text-[#001219]"
        >
          {running ? "Stop" : "Start gentle pace"}
        </button>
      </div>
    </div>
  );
}
