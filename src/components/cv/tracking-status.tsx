"use client";

export type TrackingStatusKind =
  | "tracking_well"
  | "hard_to_see"
  | "camera_unavailable"
  | "idle";

const LABELS: Record<TrackingStatusKind, string> = {
  tracking_well: "Tracking well",
  hard_to_see: "Hard to see you",
  camera_unavailable: "Camera unavailable",
  idle: "Ready when you are",
};

type TrackingStatusProps = {
  status: TrackingStatusKind;
  detail?: string | null;
};

/**
 * Text-only tracking feedback — motion-safe, no flashy CV chrome.
 */
export function TrackingStatus({ status, detail }: TrackingStatusProps) {
  return (
    <div className="flex flex-col gap-0.5" role="status" aria-live="polite">
      <p className="text-sm font-medium text-[var(--stasus-ink)]">
        {LABELS[status]}
      </p>
      {detail ? (
        <p className="text-sm text-[var(--stasus-ink-muted)]">{detail}</p>
      ) : null}
    </div>
  );
}
