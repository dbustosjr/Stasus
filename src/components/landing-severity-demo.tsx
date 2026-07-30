"use client";

import { useId, useState } from "react";

type DemoPoint = {
  key: string;
  severity: number;
  label: string;
  detail: string;
};

/** Illustrative sample only — not live user data. */
const DEMO_POINTS: DemoPoint[] = [
  { key: "1", severity: 5, label: "Mon", detail: "Severity 5 · sleep came up" },
  { key: "2", severity: 6, label: "Tue", detail: "Severity 6 · busy screens" },
  { key: "3", severity: 4, label: "Wed", detail: "Severity 4 · steadier afternoon" },
  { key: "4", severity: 7, label: "Thu", detail: "Severity 7 · weather shift" },
  { key: "5", severity: 5, label: "Fri", detail: "Severity 5 · shorter flare" },
  { key: "6", severity: 3, label: "Sat", detail: "Severity 3 · rest day" },
  { key: "7", severity: 4, label: "Sun", detail: "Severity 4 · gentle evening" },
];

export function LandingSeverityDemo() {
  const titleId = useId();
  const [selectedKey, setSelectedKey] = useState<string | null>("4");
  const selected =
    DEMO_POINTS.find((p) => p.key === selectedKey) ?? null;

  const width = 320;
  const height = 112;
  const padX = 28;
  const padY = 12;
  const min = 1;
  const max = 10;
  const xs = DEMO_POINTS.map((_, i) =>
    padX + (i * (width - padX * 2)) / (DEMO_POINTS.length - 1),
  );
  const ys = DEMO_POINTS.map(
    (p) => padY + ((max - p.severity) / (max - min)) * (height - padY * 2),
  );
  const path = xs
    .map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${ys[i]!.toFixed(1)}`)
    .join(" ");

  function toggle(key: string) {
    setSelectedKey((cur) => (cur === key ? null : key));
  }

  return (
    <figure
      className="mt-5 max-w-md rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-4 py-4 sm:px-5"
      aria-labelledby={titleId}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <figcaption
          id={titleId}
          className="text-sm font-semibold text-[var(--stasus-ink)]"
        >
          Severity trend
        </figcaption>
        <span className="text-xs font-medium tracking-wide text-[var(--stasus-ink-muted)] uppercase">
          Example
        </span>
      </div>
      <p className="mt-1 text-sm text-[var(--stasus-ink-muted)]">
        Tap a point to inspect a log, the way it works in your tracker.
      </p>

      <div className="mt-4 flex gap-2">
        <div
          className="flex w-6 shrink-0 flex-col justify-between py-1 text-[10px] leading-none text-[var(--stasus-ink-muted)]"
          aria-hidden
        >
          <span>10</span>
          <span>5</span>
          <span>1</span>
        </div>
        <div className="min-w-0 flex-1">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-28 w-full"
            role="group"
            aria-label="Example severity over a recent week"
          >
            {[1, 5, 10].map((sev) => {
              const y =
                padY + ((max - sev) / (max - min)) * (height - padY * 2);
              return (
                <line
                  key={sev}
                  x1={padX}
                  x2={width - padX}
                  y1={y}
                  y2={y}
                  stroke="var(--stasus-border)"
                  strokeWidth="1"
                  opacity={sev === 5 ? 0.7 : 0.35}
                />
              );
            })}
            <path
              d={path}
              fill="none"
              stroke="var(--stasus-teal-secondary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="motion-safe:animate-[stasus-rise_0.9s_ease-out_both]"
              pointerEvents="none"
            />
            {DEMO_POINTS.map((point, i) => {
              const x = xs[i]!;
              const y = ys[i]!;
              const on = selectedKey === point.key;
              return (
                <g key={point.key}>
                  <circle
                    cx={x}
                    cy={y}
                    r={14}
                    fill="transparent"
                    className="cursor-pointer outline-none focus-visible:stroke-[var(--stasus-aqua)] focus-visible:stroke-2"
                    role="button"
                    tabIndex={0}
                    aria-label={`${point.label}: severity ${point.severity}`}
                    aria-pressed={on}
                    onClick={() => toggle(point.key)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggle(point.key);
                      }
                    }}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={on ? 5.5 : 3.5}
                    fill="var(--stasus-aqua)"
                    stroke={on ? "var(--stasus-ink)" : "transparent"}
                    strokeWidth={on ? 1.5 : 0}
                    pointerEvents="none"
                  />
                </g>
              );
            })}
          </svg>
          <div className="mt-1 flex justify-between text-[10px] text-[var(--stasus-ink-muted)]">
            <span>{DEMO_POINTS[0]!.label}</span>
            <span>{DEMO_POINTS[DEMO_POINTS.length - 1]!.label}</span>
          </div>
        </div>
      </div>

      <div
        className="mt-4 border-t border-[var(--stasus-border)] pt-3"
        aria-live="polite"
      >
        {selected ? (
          <p className="text-sm text-[var(--stasus-ink)]">
            <span className="font-medium">{selected.label}</span>
            <span className="text-[var(--stasus-ink-muted)]">
              {": "}
              {selected.detail}
            </span>
          </p>
        ) : (
          <p className="text-sm text-[var(--stasus-ink-muted)]">
            Tap a point to see an example detail.
          </p>
        )}
      </div>
    </figure>
  );
}
