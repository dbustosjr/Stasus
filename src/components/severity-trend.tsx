"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { triggerLabel } from "@/lib/tracker/types";
import {
  buildTrendPoints,
  DAY_PRESETS,
  ENTRY_PRESETS,
  formatSeverity,
  framingForPoints,
  parseTrendPrefs,
  prefsForModeSwitch,
  STORAGE_KEY,
  truncateNotes,
  type TrendLog,
  type TrendMode,
  type TrendPoint,
  type TrendPrefs,
} from "@/lib/tracker/severity-trend";

type Props = {
  logs: TrendLog[];
  timeZone?: string;
};

const PREFS_EVENT = "stasus-severity-trend";

function subscribePrefs(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(PREFS_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(PREFS_EVENT, onStoreChange);
  };
}

function getPrefsSnapshot(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writePrefs(prefs: TrendPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore quota / private mode */
  }
  window.dispatchEvent(new Event(PREFS_EVENT));
}

function pointLabel(point: TrendPoint): string {
  if (point.kind === "entry") {
    return `Severity ${point.severity} at ${new Date(point.logged_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}`;
  }
  return `Average severity ${formatSeverity(point.severity)} on ${point.date}`;
}

function scrollToLog(id: string) {
  const el = document.getElementById(`log-${id}`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.setAttribute("data-highlight", "true");
  window.setTimeout(() => {
    el.removeAttribute("data-highlight");
  }, 1500);
}

function LogDetail({
  log,
  showJump,
}: {
  log: TrendLog;
  showJump: boolean;
}) {
  const notes = truncateNotes(log.notes);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm text-[var(--stasus-ink-muted)]">
            {new Date(log.logged_at).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          <p className="mt-0.5 font-medium text-[var(--stasus-ink)]">
            Severity {log.severity}/10
          </p>
        </div>
        {showJump ? (
          <button
            type="button"
            onClick={() => scrollToLog(log.id)}
            className="min-h-11 text-sm font-semibold text-[var(--stasus-aqua)] underline-offset-2 hover:underline"
          >
            View in list
          </button>
        ) : null}
      </div>
      {log.triggers.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {log.triggers.map((t) => (
            <span
              key={t}
              className="rounded-full bg-[color-mix(in_srgb,var(--stasus-aqua)_22%,transparent)] px-3 py-1 text-xs font-medium text-[var(--stasus-ink)]"
            >
              {triggerLabel(t)}
            </span>
          ))}
        </div>
      ) : null}
      {notes ? (
        <p className="text-sm leading-relaxed text-[var(--stasus-ink-muted)]">
          {notes}
        </p>
      ) : null}
    </div>
  );
}

export function SeverityTrend({ logs, timeZone }: Props) {
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const rawPrefs = useSyncExternalStore(
    subscribePrefs,
    getPrefsSnapshot,
    () => null,
  );
  const prefs = parseTrendPrefs(rawPrefs);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") setSelectedKey(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const points = buildTrendPoints(logs, {
    mode: prefs.mode,
    preset: prefs.preset,
    timeZone,
  });
  const selected = points.find((p) => p.key === selectedKey) ?? null;
  const presets = prefs.mode === "entries" ? ENTRY_PRESETS : DAY_PRESETS;
  const framing = points.length < 2 ? null : framingForPoints(points);

  const width = 320;
  const height = 112;
  const padX = 28;
  const padY = 12;
  const min = 1;
  const max = 10;
  const xs = points.map((_, i) =>
    points.length === 1
      ? width / 2
      : padX + (i * (width - padX * 2)) / (points.length - 1),
  );
  const ys = points.map(
    (p) => padY + ((max - p.severity) / (max - min)) * (height - padY * 2),
  );
  const path = xs
    .map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${ys[i]!.toFixed(1)}`)
    .join(" ");

  const startLabel =
    points[0]?.kind === "day"
      ? points[0].date
      : points[0]
        ? new Date(points[0].logged_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })
        : "";
  const last = points[points.length - 1];
  const endLabel =
    last?.kind === "day"
      ? last.date
      : last?.kind === "entry"
        ? new Date(last.logged_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })
        : "";

  function setMode(mode: TrendMode) {
    setSelectedKey(null);
    writePrefs(prefsForModeSwitch(prefs, mode));
  }

  function setPreset(preset: number) {
    setSelectedKey(null);
    writePrefs({ ...prefs, preset });
  }

  function togglePoint(key: string) {
    setSelectedKey((cur) => (cur === key ? null : key));
  }

  function onChartPointerDown(e: ReactPointerEvent<SVGSVGElement>) {
    if (e.target === e.currentTarget) setSelectedKey(null);
  }

  function onPointKeyDown(e: KeyboardEvent, index: number, key: string) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      togglePoint(key);
      return;
    }
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const delta = e.key === "ArrowRight" ? 1 : -1;
      const next = points[index + delta];
      if (!next) return;
      setSelectedKey(next.key);
      const btn = rootRef.current?.querySelector<HTMLElement>(
        `[data-point-key="${next.key}"]`,
      );
      btn?.focus();
    }
  }

  const chipClass = (active: boolean) =>
    `inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)] ${
      active
        ? "bg-[var(--stasus-aqua)] text-[#001219]"
        : "border border-[var(--stasus-border)] bg-[var(--stasus-bg)] text-[var(--stasus-ink)]"
    }`;

  return (
    <div
      ref={rootRef}
      className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-5 py-4"
    >
      <h2
        id={titleId}
        className="text-sm font-semibold text-[var(--stasus-ink)]"
      >
        Recent severity trend
      </h2>
      {framing ? (
        <p className="mt-1 text-sm text-[var(--stasus-ink-muted)]">{framing}</p>
      ) : null}

      <div className="mt-4 flex flex-col gap-3">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Trend range mode"
        >
          <button
            type="button"
            className={chipClass(prefs.mode === "entries")}
            aria-pressed={prefs.mode === "entries"}
            onClick={() => setMode("entries")}
          >
            Entries
          </button>
          <button
            type="button"
            className={chipClass(prefs.mode === "days")}
            aria-pressed={prefs.mode === "days"}
            onClick={() => setMode("days")}
          >
            Days
          </button>
        </div>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={
            prefs.mode === "entries" ? "Number of entries" : "Number of days"
          }
        >
          {presets.map((n) => (
            <button
              key={n}
              type="button"
              className={chipClass(prefs.preset === n)}
              aria-pressed={prefs.preset === n}
              onClick={() => setPreset(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {points.length < 2 ? (
        <p className="mt-4 text-sm text-[var(--stasus-ink-muted)]">
          Log a few entries in this window to see a gentle trend. Trends are
          informational, not a grade.
        </p>
      ) : (
        <>
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
                className="h-28 w-full max-w-md"
                role="img"
                aria-labelledby={titleId}
                onPointerDown={onChartPointerDown}
              >
                <title>Severity over the selected window</title>
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
                  pointerEvents="none"
                />
                {points.map((point, i) => {
                  const x = xs[i]!;
                  const y = ys[i]!;
                  const selectedHere = selectedKey === point.key;
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
                        data-point-key={point.key}
                        aria-label={pointLabel(point)}
                        aria-pressed={selectedHere}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePoint(point.key);
                        }}
                        onKeyDown={(e) => onPointKeyDown(e, i, point.key)}
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r={selectedHere ? 5.5 : 3.5}
                        fill="var(--stasus-aqua)"
                        stroke={
                          selectedHere ? "var(--stasus-ink)" : "transparent"
                        }
                        strokeWidth={selectedHere ? 1.5 : 0}
                        pointerEvents="none"
                      />
                    </g>
                  );
                })}
              </svg>
              <div className="mt-1 flex justify-between text-[10px] text-[var(--stasus-ink-muted)]">
                <span>{startLabel}</span>
                <span>{endLabel}</span>
              </div>
            </div>
          </div>

          <div
            className="mt-4 border-t border-[var(--stasus-border)] pt-4"
            aria-live="polite"
          >
            {selected ? (
              selected.kind === "entry" ? (
                <LogDetail log={selected.log} showJump />
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-[var(--stasus-ink-muted)]">
                      {new Date(`${selected.date}T12:00:00`).toLocaleDateString(
                        undefined,
                        { dateStyle: "medium" },
                      )}
                    </p>
                    <p className="mt-0.5 font-medium text-[var(--stasus-ink)]">
                      Average severity {formatSeverity(selected.severity)}/10
                      <span className="font-normal text-[var(--stasus-ink-muted)]">
                        {" "}
                        · {selected.logs.length}{" "}
                        {selected.logs.length === 1 ? "log" : "logs"}
                      </span>
                    </p>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {[...selected.logs]
                      .sort(
                        (a, b) =>
                          new Date(b.logged_at).getTime() -
                          new Date(a.logged_at).getTime(),
                      )
                      .map((log) => (
                        <li
                          key={log.id}
                          className="rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-bg)] px-3 py-3"
                        >
                          <LogDetail log={log} showJump />
                        </li>
                      ))}
                  </ul>
                </div>
              )
            ) : (
              <p className="text-sm text-[var(--stasus-ink-muted)]">
                Tap a point to see details and jump to that log.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
