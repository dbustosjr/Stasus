import Link from "next/link";
import { requireOnboarded } from "@/lib/auth/require-onboarded";
import { AppShell } from "@/components/app-shell";
import { SeverityTrend } from "@/components/severity-trend";
import { deleteSymptomLog } from "@/app/actions/tracker";
import { triggerLabel, type SymptomLog } from "@/lib/tracker/types";

function asLog(row: Record<string, unknown>): SymptomLog {
  return {
    id: String(row.id),
    severity: Number(row.severity),
    duration_minutes:
      row.duration_minutes === null || row.duration_minutes === undefined
        ? null
        : Number(row.duration_minutes),
    triggers: Array.isArray(row.triggers) ? (row.triggers as string[]) : [],
    notes: (row.notes as string | null) ?? null,
    logged_at: String(row.logged_at),
  };
}

export default async function TrackerPage() {
  const { insforge, user, profile } = await requireOnboarded();

  const { data, error } = await insforge.database
    .from("symptom_logs")
    .select("id, severity, duration_minutes, triggers, notes, logged_at")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .limit(200);

  const logs = (data ?? []).map((row) => asLog(row as Record<string, unknown>));

  return (
    <AppShell email={user.email} active="tracker">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--stasus-ink)]">
            Symptom tracker
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--stasus-ink-muted)]">
            Log severity, duration, and triggers at your own pace. Entries are
            private to your account. After logging, calm tools are available if
            checking urges rise.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/app/calm"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-5 text-sm font-semibold text-[var(--stasus-ink)]"
          >
            Calm tools
          </Link>
          <Link
            href="/app/tracker/new"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--stasus-teal)] px-5 text-sm font-semibold text-white dark:bg-[var(--stasus-aqua)] dark:text-[#001219]"
          >
            New entry
          </Link>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          Could not load entries: {error.message}
        </p>
      ) : null}

      <SeverityTrend logs={logs} timeZone={profile.timezone} />

      {logs.length === 0 ? (
        <div className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-6 py-10 text-center">
          <p className="text-[var(--stasus-ink-muted)]">
            No entries yet. When something flares, capture it here — neutrally,
            without judgment.
          </p>
          <Link
            href="/app/tracker/new"
            className="mt-4 inline-flex text-sm font-semibold text-[var(--stasus-teal)] dark:text-[var(--stasus-aqua)]"
          >
            Log your first entry
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {logs.map((log) => (
            <li
              key={log.id}
              id={`log-${log.id}`}
              className="scroll-mt-24 rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-5 py-4 transition-[box-shadow,border-color] duration-500 data-[highlight=true]:border-[var(--stasus-aqua)] data-[highlight=true]:shadow-[0_0_0_1px_var(--stasus-aqua)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-[var(--stasus-ink-muted)]">
                    {new Date(log.logged_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[var(--stasus-ink)]">
                    Severity {log.severity}/10
                    {log.duration_minutes !== null
                      ? ` · ${log.duration_minutes} min`
                      : ""}
                  </p>
                </div>
                <form action={deleteSymptomLog}>
                  <input type="hidden" name="id" value={log.id} />
                  <button
                    type="submit"
                    className="text-sm text-[var(--stasus-ink-muted)] hover:text-[var(--stasus-ink)]"
                  >
                    Delete
                  </button>
                </form>
              </div>
              {log.triggers.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
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
              {log.notes ? (
                <p className="mt-3 text-sm leading-relaxed text-[var(--stasus-ink-muted)]">
                  {log.notes}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
