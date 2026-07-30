import {
  archiveSymptomLog,
  deleteSymptomLog,
  unarchiveSymptomLog,
} from "@/app/actions/tracker";
import { triggerLabel, type SymptomLog } from "@/lib/tracker/types";

export function SymptomLogCard({
  log,
  archived = false,
}: {
  log: SymptomLog;
  archived?: boolean;
}) {
  return (
    <li
      id={`log-${log.id}`}
      className="scroll-mt-24 rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-bg)] px-5 py-4 transition-[box-shadow,border-color] duration-500 data-[highlight=true]:border-[var(--stasus-aqua)] data-[highlight=true]:shadow-[0_0_0_1px_var(--stasus-aqua)]"
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
        <div className="flex flex-wrap items-center gap-3">
          {archived ? (
            <form action={unarchiveSymptomLog}>
              <input type="hidden" name="id" value={log.id} />
              <button
                type="submit"
                className="min-h-11 cursor-pointer px-1 text-sm text-[var(--stasus-ink-muted)] hover:text-[var(--stasus-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)]"
              >
                Restore
              </button>
            </form>
          ) : (
            <form action={archiveSymptomLog}>
              <input type="hidden" name="id" value={log.id} />
              <button
                type="submit"
                className="min-h-11 cursor-pointer px-1 text-sm text-[var(--stasus-ink-muted)] hover:text-[var(--stasus-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)]"
              >
                Archive
              </button>
            </form>
          )}
          <form action={deleteSymptomLog}>
            <input type="hidden" name="id" value={log.id} />
            <button
              type="submit"
              className="min-h-11 cursor-pointer px-1 text-sm text-[var(--stasus-ink-muted)] hover:text-red-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
            >
              Delete
            </button>
          </form>
        </div>
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
  );
}
