import { requireOnboarded } from "@/lib/auth/require-onboarded";
import { AppShell } from "@/components/app-shell";
import { GenerateInsightButton } from "@/components/generate-insight-button";

export default async function InsightsPage() {
  const { insforge, user } = await requireOnboarded();

  const { data: insights, error } = await insforge.database
    .from("ai_insights")
    .select("id, week_start, insight_text, model_used, generated_at")
    .eq("user_id", user.id)
    .order("week_start", { ascending: false })
    .limit(12);

  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);

  return (
    <AppShell email={user.email} active="insights">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--stasus-ink)]">
          Weekly insights
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--stasus-ink-muted)]">
          Pattern-level summaries on a weekly cadence — not reactive coaching
          after each log. No diagnoses or medication advice.
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
          No weekly insights yet. Log a few tracker entries across the week,
          then generate when ready.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {insights.map((row) => {
            const item = row as {
              id: string;
              week_start: string;
              insight_text: string;
              model_used: string;
              generated_at: string;
            };
            return (
              <li
                key={item.id}
                className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-5 py-5"
              >
                <p className="text-sm text-[var(--stasus-ink-muted)]">
                  Week of {item.week_start}
                </p>
                <p className="mt-3 whitespace-pre-wrap leading-relaxed text-[var(--stasus-ink)]">
                  {item.insight_text}
                </p>
                <p className="mt-3 text-xs text-[var(--stasus-ink-muted)]">
                  Model: {item.model_used}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
