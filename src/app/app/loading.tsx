export default function AppLoading() {
  return (
    <div
      className="flex flex-col gap-5 animate-pulse"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="h-9 w-48 rounded-lg bg-[var(--stasus-surface)]" />
      <div className="h-4 w-full max-w-xl rounded bg-[var(--stasus-surface)]" />
      <div className="mt-2 h-28 w-full rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)]" />
      <div className="h-16 w-full rounded-xl bg-[var(--stasus-surface)]" />
      <div className="h-16 w-full rounded-xl bg-[var(--stasus-surface)]" />
    </div>
  );
}
