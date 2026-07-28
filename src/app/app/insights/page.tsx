import { requireOnboarded } from "@/lib/auth/require-onboarded";
import { AppShell } from "@/components/app-shell";
import { GenerateInsightButton } from "@/components/generate-insight-button";

function formatWeekLabel(weekStart: string): string {
  const d = new Date(`${weekStart}T12:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return `Week of ${weekStart}`;
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function InsightsPage() {
  const { insforge, user } = await requireOnboarded();

  const { data: insights, error } = await insforge.database
    .from("ai_insights")
    .select("id, week_start, insight_text, generated_at")
    .eq("user_id", user.id)
    .order("week_start", { ascending: false })
    .limit(12);

  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);

  return (
    <AppShell email={user.email} active="insights">
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--stasus-ink)] sm:text-4xl">
          Weekly notes
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--stasus-ink-muted)]">
          Once a week, a short look at what you logged — written like a note,
          not a clinical readout. No diagnoses. No medication advice.
        </p>
      </div>

      {!hasKey ? (
        <div className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-5 py-4 text-sm text-[var(--stasus-ink-muted)]">
          Server key missing: add{" "}
          <code className="text-[var(--stasus-ink)]">ANTHROPIC_API_KEY</code> to{" "}
          <code className="text-[var(--stasus-ink)]">.env.local</code> to enable
          generation. Red-flag emergency routing works without it.
        </div>
      ) : (
        <GenerateInsightButton />
      )}

      {error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          Could not load insights: {error.message}
        </p>
      ) : null}

      {!insights?.length ? (
        <p className="text-[var(--stasus-ink-muted)]">
          Nothing here yet. A few tracker entries across the week give this
          something gentle to work with.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--stasus-border)] border-y border-[var(--stasus-border)]">
          {insights.map((row) => {
            const item = row as {
              id: string;
              week_start: string;
              insight_text: string;
              generated_at: string;
            };
            return (
              <li key={item.id} className="py-6">
                <p className="text-sm text-[var(--stasus-ink-muted)]">
                  Week of {formatWeekLabel(item.week_start)}
                </p>
                <div className="mt-3 max-w-2xl whitespace-pre-wrap text-base leading-relaxed text-[var(--stasus-ink)]">
                  {item.insight_text}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
