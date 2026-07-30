/** Format stored session seconds for display (e.g. 3m, 2m 30s, 45s). */
export function formatSessionDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "";
  const whole = Math.round(totalSeconds);
  const minutes = Math.floor(whole / 60);
  const seconds = whole % 60;
  if (minutes === 0) return `${seconds}s`;
  if (seconds === 0) return `${minutes}m`;
  return `${minutes}m ${seconds}s`;
}
