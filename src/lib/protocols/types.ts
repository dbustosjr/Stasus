import {
  CATEGORY_META,
  EXERCISE_CATEGORIES,
  type ExerciseCategory,
} from "@/lib/exercises/types";

export type ProtocolEvent = {
  id: string;
  exercise_category: ExerciseCategory;
  protocol_label: string | null;
  adherence_target_per_week: number | null;
  started_at: string;
  ended_at: string | null;
  notes: string | null;
};

export function isExerciseCategory(value: string): value is ExerciseCategory {
  return (EXERCISE_CATEGORIES as readonly string[]).includes(value);
}

export function protocolCategoryLabel(category: ExerciseCategory): string {
  return CATEGORY_META[category].label;
}

export function defaultProtocolLabel(category: ExerciseCategory): string {
  return `${CATEGORY_META[category].label} protocol`;
}
