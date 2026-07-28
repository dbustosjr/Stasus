export const RED_FLAG_SIGNALS = [
  {
    id: "sudden_severe_vertigo",
    label: "Sudden severe vertigo / spinning",
  },
  {
    id: "slurred_speech",
    label: "Slurred speech",
  },
  {
    id: "facial_drooping",
    label: "Facial drooping",
  },
  {
    id: "limb_weakness",
    label: "Limb weakness",
  },
  {
    id: "sudden_severe_headache",
    label: "Sudden severe headache",
  },
] as const;

export type RedFlagSignalId = (typeof RED_FLAG_SIGNALS)[number]["id"];

const COMPANION_SIGNS: RedFlagSignalId[] = [
  "slurred_speech",
  "facial_drooping",
  "limb_weakness",
  "sudden_severe_headache",
];

/**
 * Hard-coded stroke-suggestive combination from PRD §6.5.
 * Intentionally NOT model-based — must override normal assistant/tracker flow.
 */
export function evaluateRedFlag(signals: string[]): {
  triggered: boolean;
  pattern: string | null;
  matched: string[];
} {
  const set = new Set(signals);
  const hasSuddenSevereVertigo = set.has("sudden_severe_vertigo");
  const companions = COMPANION_SIGNS.filter((id) => set.has(id));

  if (hasSuddenSevereVertigo && companions.length > 0) {
    return {
      triggered: true,
      pattern: `sudden_severe_vertigo+${companions.sort().join("+")}`,
      matched: ["sudden_severe_vertigo", ...companions],
    };
  }

  return { triggered: false, pattern: null, matched: [] };
}
