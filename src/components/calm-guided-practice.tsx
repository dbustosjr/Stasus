"use client";

import { useState } from "react";
import {
  FEAR_AVOIDANCE,
  GROUNDING,
  SYMPTOM_CHECKING,
} from "@/lib/calm/content";

async function stampCalm() {
  try {
    const { recordActivityDay } = await import("@/app/actions/activity");
    await recordActivityDay("calm");
  } catch {
    // ignore
  }
}

const btnPrimary =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-[var(--stasus-aqua)] px-5 text-sm font-semibold text-[#001219] transition-colors hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_82%,white)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";
const btnSecondary =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-[var(--stasus-border)] px-5 text-sm font-medium text-[var(--stasus-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_16%,transparent)] active:scale-[0.98]";

type StepperProps = {
  title: string;
  steps: string[];
  doneLabel?: string;
};

function GuidedStepper({ title, steps, doneLabel = "Done" }: StepperProps) {
  const [index, setIndex] = useState(-1);
  const [finished, setFinished] = useState(false);

  if (finished) {
    return (
      <div className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-5 py-4">
        <p className="text-sm font-medium text-[var(--stasus-ink)]">
          Nice work finishing {title.toLowerCase()}.
        </p>
        <p className="mt-1 text-sm text-[var(--stasus-ink-muted)]">
          You can close this and get back to your day, or run it again later.
        </p>
        <button
          type="button"
          className={`${btnSecondary} mt-3`}
          onClick={() => {
            setIndex(-1);
            setFinished(false);
          }}
        >
          Practice again
        </button>
      </div>
    );
  }

  if (index < 0) {
    return (
      <div className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-5 py-4">
        <p className="text-sm text-[var(--stasus-ink-muted)]">
          A short guided walkthrough. Go one step at a time. Skip anytime.
        </p>
        <button
          type="button"
          className={`${btnPrimary} mt-3`}
          onClick={() => setIndex(0)}
        >
          Start guided practice
        </button>
      </div>
    );
  }

  const step = steps[index]!;
  const last = index >= steps.length - 1;

  return (
    <div className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-5 py-4">
      <p className="text-xs font-semibold tracking-wide text-[var(--stasus-ink-muted)] uppercase">
        Step {index + 1} of {steps.length}
      </p>
      <p className="mt-3 text-base leading-relaxed text-[var(--stasus-ink)]">
        {step}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={btnPrimary}
          onClick={() => {
            if (last) {
              setFinished(true);
              void stampCalm();
            } else {
              setIndex((i) => i + 1);
            }
          }}
        >
          {last ? doneLabel : "Next"}
        </button>
        <button
          type="button"
          className={btnSecondary}
          onClick={() => {
            setIndex(-1);
            setFinished(false);
          }}
        >
          Exit
        </button>
      </div>
    </div>
  );
}

export function FearAvoidanceGuide() {
  const steps = [
    ...FEAR_AVOIDANCE.steps.map((s) => `${s.label}: ${s.text}`),
    FEAR_AVOIDANCE.practice,
  ];
  return <GuidedStepper title={FEAR_AVOIDANCE.title} steps={steps} />;
}

export function SymptomCheckingGuide() {
  const steps = SYMPTOM_CHECKING.prompts.map(
    (p) => `When the urge is “${p.urge}” try: ${p.reframe}`,
  );
  return <GuidedStepper title={SYMPTOM_CHECKING.title} steps={steps} />;
}

export function GroundingGuide() {
  const [toolIndex, setToolIndex] = useState(0);
  const tool = GROUNDING.tools[toolIndex] ?? GROUNDING.tools[0]!;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {GROUNDING.tools.map((t, i) => (
          <button
            key={t.name}
            type="button"
            onClick={() => setToolIndex(i)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              i === toolIndex
                ? "bg-[var(--stasus-aqua)] text-[#001219]"
                : "border border-[var(--stasus-border)] text-[var(--stasus-ink-muted)] hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_16%,transparent)] hover:text-[var(--stasus-ink)]"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>
      <GuidedStepper
        key={tool.name}
        title={tool.name}
        steps={tool.steps}
        doneLabel="Finish grounding"
      />
    </div>
  );
}
