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
      "Ease into motion or busy visuals that usually stir symptoms, a little at a time.",
  },
  gaze_stabilization: {
    label: "Gaze stabilization",
    summary:
      "Keep a target clear while your head moves, so vision feels a bit steadier.",
  },
  balance_training: {
    label: "Balance training",
    summary:
      "Quiet standing and stepping practice with support nearby when you need it.",
  },
  canalith_repositioning: {
    label: "Canalith repositioning",
    summary:
      "What BPPV-style repositioning is about. Not a daily exercise routine.",
    isManeuver: true,
  },
};
