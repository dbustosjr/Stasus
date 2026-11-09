import type { Exercise, ExerciseCategory } from "../exercises/types.ts";
import type { ProtocolEvent } from "../protocols/types.ts";
import type { CustomTrigger, SymptomLog } from "../tracker/types.ts";

export type DemoProfile = {
  timezone: string;
  condition_label: string | null;
  suggested_categories: ExerciseCategory[];
  display_name: string;
};

export type DemoSession = {
  id: string;
  exercise_id: string;
  completed_at: string;
  duration_seconds: number | null;
  rep_count: number | null;
  cv_confidence_avg: number | null;
  notes: string | null;
};

export type DemoInsight = {
  id: string;
  cadence: "daily" | "weekly" | "monthly";
  period_start: string;
  week_start: string;
  insight_text: string;
  generated_at: string;
};

export type DemoOutcomeTrend = {
  id: string;
  window_weeks: number;
  window_start: string;
  window_end: string;
  adherence_rate: number | null;
  severity_delta: number | null;
  significant: boolean;
  summary_text: string | null;
  generated_at: string;
};

export type DemoState = {
  version: 1;
  profile: DemoProfile;
  exercises: Exercise[];
  symptomLogs: SymptomLog[];
  customTriggers: CustomTrigger[];
  sessions: DemoSession[];
  protocols: ProtocolEvent[];
  insights: DemoInsight[];
  insightPoolIndex: number;
  outcomeTrends: DemoOutcomeTrend[];
  activityDates: string[];
  calmCompletions: number;
};
