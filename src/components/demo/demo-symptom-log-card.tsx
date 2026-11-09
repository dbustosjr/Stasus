import { triggerLabel, type SymptomLog } from "@/lib/tracker/types";

/** Read-only symptom card for demo (no live archive/delete actions). */
export function DemoSymptomLogCard({ log }: { log: SymptomLog }) {
  return (
    <li className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-bg)] px-5 py-4">
      <p className="text-sm text-[var(--stasus-ink-muted)]">
        {new Date(log.logged_at).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </p>
      <p className="mt-1 text-lg font-semibold text-[var(--stasus-ink)]">
        Severity {log.severity}/10
        {log.duration_minutes !== null ? ` · ${log.duration_minutes} min` : ""}
      </p>
      {log.triggers.length > 0 ? (
        <p className="mt-2 text-sm text-[var(--stasus-ink-muted)]">
          {log.triggers.map(triggerLabel).join(" · ")}
        </p>
      ) : null}
      {log.notes ? (
        <p className="mt-2 text-sm text-[var(--stasus-ink)]">{log.notes}</p>
      ) : null}
    </li>
  );
}
