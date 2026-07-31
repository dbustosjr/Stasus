import Link from "next/link";
import { requireOnboarded } from "@/lib/auth/require-onboarded";
import { AppShell } from "@/components/app-shell";
import { SeverityTrend } from "@/components/severity-trend";
import { SymptomLogCard } from "@/components/symptom-log-card";
import { TrackerEntrySection } from "@/components/tracker-entry-section";
import { type SymptomLog } from "@/lib/tracker/types";

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
    archived_at:
      row.archived_at === null || row.archived_at === undefined
        ? null
        : String(row.archived_at),
  };
}

export default async function TrackerPage() {
  const { insforge, user, profile } = await requireOnboarded();

  const { data, error } = await insforge.database
    .from("symptom_logs")
    .select(
      "id, severity, duration_minutes, triggers, notes, logged_at, archived_at",
    )
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .limit(200);

  const logs = (data ?? []).map((row) => asLog(row as Record<string, unknown>));
  const saved = logs.filter((log) => !log.archived_at);
  const archived = logs.filter((log) => Boolean(log.archived_at));

  return (
    <AppShell email={user.email} active="tracker">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--stasus-ink)]">
            Symptom tracker
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--stasus-ink-muted)]">
            Jot severity, how long it lasted, and anything that may have stirred
            it. Your entries stay private. If you feel the urge to keep checking
            afterward, the calm tools are right there.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/app/calm"
            prefetch
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-5 text-sm font-semibold text-[var(--stasus-ink)] transition-transform active:scale-[0.98]"
          >
            Calm tools
          </Link>
          <Link
            href="/app/tracker/new"
            prefetch
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--stasus-teal)] px-5 text-sm font-semibold text-white transition-transform active:scale-[0.98] dark:bg-[var(--stasus-aqua)] dark:text-[#001219]"
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

      <SeverityTrend logs={saved} timeZone={profile.timezone} />

      {logs.length === 0 ? (
        <div className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-6 py-10 text-center">
          <p className="text-[var(--stasus-ink-muted)]">
            No entries yet. When something flares, you can write it down here
            without overthinking it.
          </p>
          <Link
            href="/app/tracker/new"
            prefetch
            className="mt-4 inline-flex text-sm font-semibold text-[var(--stasus-teal)] transition-transform active:scale-[0.98] dark:text-[var(--stasus-aqua)]"
          >
            Log your first entry
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <TrackerEntrySection
            title="Saved entries"
            count={saved.length}
            defaultOpen
            empty={
              <p className="text-sm text-[var(--stasus-ink-muted)]">
                No saved entries right now. New logs show up here, or restore one
                from Archived.
              </p>
            }
          >
            {saved.map((log) => (
              <SymptomLogCard key={log.id} log={log} />
            ))}
          </TrackerEntrySection>

          <TrackerEntrySection
            title="Archived entries"
            count={archived.length}
            empty={
              <p className="text-sm text-[var(--stasus-ink-muted)]">
                Nothing archived yet. Use Archive on a saved entry to move it
                here.
              </p>
            }
          >
            {archived.map((log) => (
              <SymptomLogCard key={log.id} log={log} archived />
            ))}
          </TrackerEntrySection>
        </div>
      )}
    </AppShell>
  );
}
