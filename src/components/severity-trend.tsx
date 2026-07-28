type Point = { severity: number; logged_at: string };

export function SeverityTrend({ points }: { points: Point[] }) {
  if (points.length < 2) {
    return (
      <p className="text-sm text-[var(--stasus-ink-muted)]">
        Log a few entries to see a gentle trend. Trends are informational, not a
        grade.
      </p>
    );
  }

  const ordered = [...points].reverse();
  const width = 320;
  const height = 96;
  const pad = 8;
  const min = 1;
  const max = 10;
  const xs = ordered.map((_, i) =>
    ordered.length === 1
      ? width / 2
      : pad + (i * (width - pad * 2)) / (ordered.length - 1),
  );
  const ys = ordered.map(
    (p) =>
      pad +
      ((max - p.severity) / (max - min)) * (height - pad * 2),
  );
  const path = xs
    .map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${ys[i].toFixed(1)}`)
    .join(" ");

  const latest = ordered[ordered.length - 1]?.severity;
  const earliest = ordered[0]?.severity;
  const delta =
    latest !== undefined && earliest !== undefined ? latest - earliest : 0;
  const framing =
    Math.abs(delta) < 1
      ? "Roughly steady across recent logs."
      : delta < 0
        ? "Recent logs trend a bit lower than the start of this window."
        : "Recent logs trend a bit higher than the start of this window — information only, not failure.";

  return (
    <div className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-5 py-4">
      <h2 className="text-sm font-semibold text-[var(--stasus-ink)]">
        Recent severity trend
      </h2>
      <p className="mt-1 text-sm text-[var(--stasus-ink-muted)]">{framing}</p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-4 h-24 w-full max-w-md"
        role="img"
        aria-label="Severity over recent entries"
      >
        <path
          d={path}
          fill="none"
          stroke="var(--stasus-teal-secondary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {xs.map((x, i) => (
          <circle
            key={`${ordered[i].logged_at}-${i}`}
            cx={x}
            cy={ys[i]}
            r="3.5"
            fill="var(--stasus-aqua)"
          />
        ))}
      </svg>
    </div>
  );
}
