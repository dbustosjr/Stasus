export const EXERCISE_CATEGORIES = [
  "habituation",
  "gaze_stabilization",
  "balance_training",
  "canalith_repositioning",
] as const;

export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

export type ExerciseInstructions = {
  steps: string[];
  duration_hint?: string;
  safety_notes?: string[];
};

export type Exercise = {
  id: string;
  category: ExerciseCategory;
  condition_tags: string[] | null;
  title: string;
  description: string | null;
  instructions: ExerciseInstructions | null;
  difficulty_level: number | null;
  requires_cv_tracking: boolean;
  sort_order: number;
};

export const CATEGORY_META: Record<
  ExerciseCategory,
  { label: string; summary: string; isManeuver?: boolean }
> = {
  habituation: {
    label: "Habituation",
    summary:
      "Gentle, progressive exposure to motion or visual patterns that tend to provoke symptoms.",
  },
  gaze_stabilization: {
    label: "Gaze stabilization",
    summary:
      "Practice keeping a target clear while your head moves — building steadier vision.",
  },
  balance_training: {
    label: "Balance training",
    summary:
      "Progressive stance and surface challenges to support postural control.",
  },
  canalith_repositioning: {
    label: "Canalith repositioning",
    summary:
      "A clinician-guided style of maneuver for BPPV — not a daily exercise routine.",
    isManeuver: true,
  },
};
