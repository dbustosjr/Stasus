import { DEMO_EXERCISES } from "./exercises.ts";
import type { DemoInsight, DemoState } from "../types.ts";

function daysAgo(n: number, hour = 14): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 20, 0, 0);
  return d.toISOString();
}

function localDateDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const DISCLAIMER =
  "\n\nWellness support only — not medical advice, diagnosis, or a treatment plan.";

export const DEMO_INSIGHT_POOL: DemoInsight[] = [
  {
    id: "demo-insight-pool-1",
    cadence: "weekly",
    period_start: localDateDaysAgo(0),
    week_start: localDateDaysAgo(0),
    insight_text:
      "This week you logged a few mid-range days and practiced gaze work twice. Visually busy places still show up as a trigger. When that happens, one short calm tool before another check can be enough." +
      DISCLAIMER,
    generated_at: new Date().toISOString(),
  },
  {
    id: "demo-insight-pool-2",
    cadence: "weekly",
    period_start: localDateDaysAgo(0),
    week_start: localDateDaysAgo(0),
    insight_text:
      "Your notes suggest sleep and stress often travel together with higher severity. Keeping practice short and stopping early still counts — consistency beats intensity here." +
      DISCLAIMER,
    generated_at: new Date().toISOString(),
  },
];

/** Fresh seed state for the portfolio demo (no live account data). */
export function createDemoSeed(): DemoState {
  const today = localDateDaysAgo(0);
  const weekStart = localDateDaysAgo(6);

  return {
    version: 1,
    profile: {
      timezone: "America/Los_Angeles",
      condition_label: "PPPD (optional label)",
      suggested_categories: [
        "habituation",
        "gaze_stabilization",
        "balance_training",
      ],
      display_name: "Demo visitor",
    },
    exercises: DEMO_EXERCISES,
    customTriggers: [
      { id: "demo-ct-1", label: "Grocery store aisles" },
      { id: "demo-ct-2", label: "Long car rides" },
    ],
    symptomLogs: [
      {
        id: "demo-log-1",
        severity: 6,
        duration_minutes: 45,
        triggers: ["visually_busy_environments", "stress_level"],
        notes: "Busy café felt louder than usual. Sat and waited it out.",
        logged_at: daysAgo(0, 11),
        archived_at: null,
      },
      {
        id: "demo-log-2",
        severity: 4,
        duration_minutes: 20,
        triggers: ["sleep_quality"],
        notes: "Mild after a short night. Settled with a walk outside.",
        logged_at: daysAgo(1, 16),
        archived_at: null,
      },
      {
        id: "demo-log-3",
        severity: 7,
        duration_minutes: 90,
        triggers: ["visually_busy_environments", "sedentary_time"],
        notes: "Screens all afternoon. Took a break and used grounding.",
        logged_at: daysAgo(2, 18),
        archived_at: null,
      },
      {
        id: "demo-log-4",
        severity: 3,
        duration_minutes: 15,
        triggers: ["weather_temperature"],
        notes: null,
        logged_at: daysAgo(3, 10),
        archived_at: null,
      },
      {
        id: "demo-log-5",
        severity: 5,
        duration_minutes: 35,
        triggers: ["stress_level", "specific_foods"],
        notes: "After a rushed lunch. Logged and moved on.",
        logged_at: daysAgo(5, 13),
        archived_at: null,
      },
      {
        id: "demo-log-6",
        severity: 4,
        duration_minutes: 25,
        triggers: ["sleep_quality"],
        notes: null,
        logged_at: daysAgo(7, 9),
        archived_at: null,
      },
      {
        id: "demo-log-7",
        severity: 8,
        duration_minutes: 120,
        triggers: ["visually_busy_environments"],
        notes: "Archived example from an older spike.",
        logged_at: daysAgo(20, 15),
        archived_at: daysAgo(19, 12),
      },
    ],
    sessions: [
      {
        id: "demo-sess-1",
        exercise_id: "demo-ex-gaze-thumb",
        completed_at: daysAgo(0, 9),
        duration_seconds: 120,
        rep_count: 8,
        cv_confidence_avg: 0.82,
        notes: null,
      },
      {
        id: "demo-sess-2",
        exercise_id: "demo-ex-hab-sitstand",
        completed_at: daysAgo(1, 8),
        duration_seconds: 210,
        rep_count: 6,
        cv_confidence_avg: 0.74,
        notes: null,
      },
      {
        id: "demo-sess-3",
        exercise_id: "demo-ex-bal-feet",
        completed_at: daysAgo(3, 17),
        duration_seconds: 180,
        rep_count: null,
        cv_confidence_avg: 0.7,
        notes: null,
      },
    ],
    protocols: [
      {
        id: "demo-proto-1",
        exercise_category: "gaze_stabilization",
        protocol_label: "Gentle gaze week",
        adherence_target_per_week: 4,
        started_at: daysAgo(5, 8),
        ended_at: null,
        notes: null,
      },
    ],
    insights: [
      {
        id: "demo-insight-daily",
        cadence: "daily",
        period_start: today,
        week_start: today,
        insight_text:
          "Today’s log sat in the middle range with visually busy places as a trigger. If checking starts looping, one calm practice is enough — you don’t need to re-test every few minutes." +
          DISCLAIMER,
        generated_at: daysAgo(0, 11),
      },
      {
        id: "demo-insight-weekly",
        cadence: "weekly",
        period_start: weekStart,
        week_start: weekStart,
        insight_text:
          "Across this week, severity drifted between quieter days and a couple of busier ones. Gaze practice showed up a few times. Patterns here are observational only — useful for noticing, not for diagnosing." +
          DISCLAIMER,
        generated_at: daysAgo(1, 12),
      },
      {
        id: "demo-insight-monthly",
        cadence: "monthly",
        period_start: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`,
        week_start: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`,
        insight_text:
          "This month’s letter: you kept a light rhythm of logging and short practices. Visually busy environments appear often next to higher days. That is information for pacing — not proof of a condition." +
          DISCLAIMER,
        generated_at: daysAgo(4, 10),
      },
    ],
    insightPoolIndex: 0,
    outcomeTrends: [
      {
        id: "demo-outcome-4",
        window_weeks: 4,
        window_start: localDateDaysAgo(28),
        window_end: today,
        adherence_rate: 0.62,
        severity_delta: -0.8,
        significant: false,
        summary_text:
          "Over 4 weeks, practice showed up most weeks and average severity eased slightly. Small shifts only — not a clinical outcome.",
        generated_at: daysAgo(1, 12),
      },
      {
        id: "demo-outcome-8",
        window_weeks: 8,
        window_start: localDateDaysAgo(56),
        window_end: today,
        adherence_rate: 0.55,
        severity_delta: -1.1,
        significant: true,
        summary_text:
          "Over 8 weeks, adherence stayed moderate and severity trended a little lower on average. Interpret gently — wellness pattern, not a treatment result.",
        generated_at: daysAgo(1, 12),
      },
    ],
    activityDates: [
      today,
      localDateDaysAgo(1),
      localDateDaysAgo(2),
      localDateDaysAgo(3),
      localDateDaysAgo(5),
      localDateDaysAgo(7),
    ],
    calmCompletions: 2,
  };
}
