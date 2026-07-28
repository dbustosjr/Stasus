export const PRESET_TRIGGERS = [
  { id: "weather_temperature", label: "Weather / temperature" },
  { id: "specific_foods", label: "Specific foods" },
  { id: "sedentary_time", label: "Sedentary time" },
  { id: "sleep_quality", label: "Sleep quality" },
  { id: "stress_level", label: "Stress level" },
  { id: "visually_busy_environments", label: "Visually busy environments" },
] as const;

export type PresetTriggerId = (typeof PRESET_TRIGGERS)[number]["id"];

export type SymptomLog = {
  id: string;
  severity: number;
  duration_minutes: number | null;
  triggers: string[];
  notes: string | null;
  logged_at: string;
};

export type CustomTrigger = {
  id: string;
  label: string;
};

export function triggerLabel(value: string): string {
  const preset = PRESET_TRIGGERS.find((t) => t.id === value);
  return preset?.label ?? value;
}
