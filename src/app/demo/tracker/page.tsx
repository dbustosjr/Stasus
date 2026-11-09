"use client";

import Link from "next/link";
import { DemoSymptomLogCard } from "@/components/demo/demo-symptom-log-card";
import { SeverityTrend } from "@/components/severity-trend";
import { TrackerEntrySection } from "@/components/tracker-entry-section";
import { useDemo } from "@/components/demo/demo-provider";
import { demoPath } from "@/lib/demo/paths";

export default function DemoTrackerPage() {
  const { state } = useDemo();
  const logs = state.symptomLogs;
  const saved = logs.filter((log) => !log.archived_at);
  const archived = logs.filter((log) => Boolean(log.archived_at));

  return (
    <>
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
            href={demoPath("/calm")}
            prefetch
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-5 text-sm font-semibold text-[var(--stasus-ink)] transition-transform active:scale-[0.98]"
          >
            Calm tools
          </Link>
          <Link
            href={demoPath("/tracker/new")}
            prefetch
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--stasus-teal)] px-5 text-sm font-semibold text-white transition-transform active:scale-[0.98] dark:bg-[var(--stasus-aqua)] dark:text-[#001219]"
          >
            New entry
          </Link>
        </div>
      </div>

      <SeverityTrend logs={saved} timeZone={state.profile.timezone} />

      {logs.length === 0 ? (
        <div className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-6 py-10 text-center">
          <p className="text-[var(--stasus-ink-muted)]">
            No entries yet. When something flares, you can write it down here
            without overthinking it.
          </p>
          <Link
            href={demoPath("/tracker/new")}
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
            empty={<p className="px-5 pb-4 text-sm text-[var(--stasus-ink-muted)]">None yet.</p>}
          >
            <ul className="flex flex-col gap-3 px-5 pb-5">
              {saved.map((log) => (
                <DemoSymptomLogCard key={log.id} log={log} />
              ))}
            </ul>
          </TrackerEntrySection>
          {archived.length > 0 ? (
            <TrackerEntrySection
              title="Archived"
              count={archived.length}
              defaultOpen={false}
              empty={null}
            >
              <ul className="flex flex-col gap-3 px-5 pb-5">
                {archived.map((log) => (
                  <DemoSymptomLogCard key={log.id} log={log} />
                ))}
              </ul>
            </TrackerEntrySection>
          ) : null}
        </div>
      )}
    </>
  );
}
