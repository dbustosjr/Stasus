import { WELLNESS_REPORT_DISCLAIMER } from "@/lib/ai/disclaimer";
import { GenerateInsightButton } from "@/components/generate-insight-button";
import { AppShell } from "@/components/app-shell";
import { requireOnboarded } from "@/lib/auth/require-onboarded";
import { computePersonalUsage } from "@/lib/insights/usage";
import { ensureMonthlyInsight } from "@/app/actions/insights";
import { normalizeTimeZone } from "@/lib/time/local-calendar";

function formatPeriodLabel(periodStart: string, cadence: string): string {
  const d = new Date(`${periodStart}T12:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return periodStart;
  if (cadence === "monthly") {
    return d.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  }
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

type InsightRow = {
  id: string;
  cadence: string;
  period_start: string;
  week_start: string;
  insight_text: string;
  generated_at: string;
};

export default async function InsightsPage() {
  const { insforge, user, profile } = await requireOnboarded();

  // Best-effort prior-month letter
  void ensureMonthlyInsight();

  const tz = normalizeTimeZone(profile.timezone);

  const { data: insights, error } = await insforge.database
    .from("ai_insights")
    .select(
      "id, cadence, period_start, week_start, insight_text, generated_at",
    )
    .eq("user_id", user.id)
    .order("generated_at", { ascending: false })
    .limit(40);

  const { data: activityRows } = await insforge.database
    .from("user_activity_days")
    .select("activity_date")
    .eq("user_id", user.id)
    .order("activity_date", { ascending: false })
    .limit(62);

  const usage = computePersonalUsage(
    tz,
    (activityRows ?? []).map((r) =>
      String((r as { activity_date: string }).activity_date),
    ),
  );

  const rows = (insights ?? []) as InsightRow[];
  const daily = rows.filter((r) => (r.cadence || "weekly") === "daily");
  const weekly = rows.filter((r) => (r.cadence || "weekly") === "weekly");
  const monthly = rows.filter((r) => r.cadence === "monthly");

  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);

  return (
    <AppShell email={user.email} active="insights">
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--stasus-ink)] sm:text-4xl">
          Insights
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--stasus-ink-muted)]">
          Short notes after you log, a weekly summary when you want one, and a
          monthly letter. Wellness support only, not medical advice.
        </p>
      </div>

      <section className="border-y border-[var(--stasus-border)] py-5">
        <h2 className="text-sm font-semibold tracking-wide text-[var(--stasus-ink)]">
          Your activity
        </h2>
        <p className="mt-1 text-sm text-[var(--stasus-ink-muted)]">
          Days you logged symptoms, practiced, or finished a calm breathing
          cycle, in your local time.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-[var(--stasus-ink-muted)]">Today</dt>
            <dd className="mt-1 text-lg font-medium text-[var(--stasus-ink)]">
              {usage.activeToday ? "Active" : "Not yet"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--stasus-ink-muted)]">
              Days this week
            </dt>
            <dd className="mt-1 text-lg font-medium text-[var(--stasus-ink)]">
              {usage.daysThisWeek}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--stasus-ink-muted)]">
              Days this month
            </dt>
            <dd className="mt-1 text-lg font-medium text-[var(--stasus-ink)]">
              {usage.daysThisMonth}
            </dd>
          </div>
        </dl>
      </section>

      {!hasKey ? (
        <div className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-5 py-4 text-sm text-[var(--stasus-ink-muted)]">
          Server key missing: add{" "}
          <code className="text-[var(--stasus-ink)]">ANTHROPIC_API_KEY</code> to{" "}
          <code className="text-[var(--stasus-ink)]">.env.local</code> to enable
          AI notes.
        </div>
      ) : (
        <GenerateInsightButton />
      )}

      {error ? (
        <p role="alert" className="text-sm text-red-300">
          Could not load insights: {error.message}
        </p>
      ) : null}

      <InsightSection
        title="Daily notes"
        empty="Log a symptom entry to get a short note with a few gentle suggestions."
        items={daily}
        cadence="daily"
      />
      <InsightSection
        title="Weekly notes"
        empty="Nothing for this week yet. Hit generate above once you have a few logs."
        items={weekly}
        cadence="weekly"
      />
      <InsightSection
        title="Monthly letters"
        empty="A monthly letter shows up after a month with at least one log."
        items={monthly}
        cadence="monthly"
      />
    </AppShell>
  );
}

function InsightSection({
  title,
  empty,
  items,
  cadence,
}: {
  title: string;
  empty: string;
  items: InsightRow[];
  cadence: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-2xl font-medium text-[var(--stasus-ink)]">
        {title}
      </h2>
      {!items.length ? (
        <p className="text-sm text-[var(--stasus-ink-muted)]">{empty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--stasus-border)] border-y border-[var(--stasus-border)]">
          {items.map((item) => {
            const period = item.period_start || item.week_start;
            return (
              <li key={item.id} className="py-6">
                <p className="text-sm text-[var(--stasus-ink-muted)]">
                  {cadence === "daily"
                    ? formatPeriodLabel(period, "daily")
                    : cadence === "monthly"
                      ? `Month of ${formatPeriodLabel(period, "monthly")}`
                      : `Week of ${formatPeriodLabel(period, "weekly")}`}
                </p>
                <div className="mt-3 max-w-2xl whitespace-pre-wrap text-base leading-relaxed text-[var(--stasus-ink)]">
                  {item.insight_text}
                </div>
                {!/not medical advice/i.test(item.insight_text) ? (
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--stasus-ink-muted)]">
                    {WELLNESS_REPORT_DISCLAIMER}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
