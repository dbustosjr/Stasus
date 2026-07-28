import type { ExerciseCategory } from "@/lib/exercises/types";

export const SYMPTOM_PATTERNS = [
  {
    id: "motion_or_visual_provoked",
    label: "Dizziness that flares with motion or busy visuals",
    categories: ["habituation"] as ExerciseCategory[],
  },
  {
    id: "gaze_unstable",
    label: "Hard to keep things clear when I move my head",
    categories: ["gaze_stabilization"] as ExerciseCategory[],
  },
  {
    id: "unsteady_balance",
    label: "Feeling unsteady on my feet",
    categories: ["balance_training"] as ExerciseCategory[],
  },
  {
    id: "positional_spinning",
    label: "Brief spinning with certain head positions (sometimes called BPPV)",
    categories: ["canalith_repositioning"] as ExerciseCategory[],
  },
  {
    id: "checking_anxiety",
    label: "I check my symptoms a lot or feel stuck in worry about them",
    categories: ["habituation"] as ExerciseCategory[],
  },
] as const;

export type SymptomPatternId = (typeof SYMPTOM_PATTERNS)[number]["id"];

export function categoriesFromPatterns(patternIds: string[]): ExerciseCategory[] {
  const set = new Set<ExerciseCategory>();
  for (const pattern of SYMPTOM_PATTERNS) {
    if (patternIds.includes(pattern.id)) {
      for (const category of pattern.categories) {
        set.add(category);
      }
    }
  }
  // Default gentle start if nothing selected
  if (set.size === 0) {
    set.add("habituation");
    set.add("balance_training");
  }
  return [...set];
}
