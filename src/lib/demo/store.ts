import { DEMO_INSIGHT_POOL, createDemoSeed } from "./fixtures/seed.ts";
import type {
  DemoInsight,
  DemoSession,
  DemoState,
} from "./types.ts";
import type { ProtocolEvent } from "../protocols/types.ts";
import type { CustomTrigger, SymptomLog } from "../tracker/types.ts";
import type { ExerciseCategory } from "../exercises/types.ts";

export const DEMO_STORAGE_KEY = "stasus.demo.v1";

export type DemoStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

function memoryStorage(): DemoStorage {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

let overrideStorage: DemoStorage | null = null;
/** Cached snapshot — must be referentially stable for useSyncExternalStore. */
let cachedState: DemoState | null = null;
/** Stable SSR snapshot (never re-created per render). */
let serverSnapshot: DemoState | null = null;

/** Test-only: inject storage. Pass null to restore browser/default. */
export function setDemoStorageForTests(storage: DemoStorage | null) {
  overrideStorage = storage;
  cachedState = null;
}

function resolveStorage(): DemoStorage {
  if (overrideStorage) return overrideStorage;
  if (typeof window !== "undefined" && window.sessionStorage) {
    return window.sessionStorage;
  }
  return memoryStorage();
}

export function isDemoState(value: unknown): value is DemoState {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    v.version === 1 &&
    Array.isArray(v.exercises) &&
    Array.isArray(v.symptomLogs) &&
    Array.isArray(v.insights) &&
    typeof v.profile === "object" &&
    v.profile !== null
  );
}

export function parseDemoState(raw: string | null): DemoState {
  if (!raw) return createDemoSeed();
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isDemoState(parsed)) return createDemoSeed();
    // Always refresh frozen exercise catalog from code (content updates).
    const seed = createDemoSeed();
    return { ...parsed, exercises: seed.exercises };
  } catch {
    return createDemoSeed();
  }
}

export function getDemoState(): DemoState {
  if (cachedState) return cachedState;
  cachedState = parseDemoState(resolveStorage().getItem(DEMO_STORAGE_KEY));
  return cachedState;
}

/** Stable server snapshot for useSyncExternalStore getServerSnapshot. */
export function getDemoServerSnapshot(): DemoState {
  if (!serverSnapshot) serverSnapshot = createDemoSeed();
  return serverSnapshot;
}

export function saveDemoState(state: DemoState): DemoState {
  resolveStorage().setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
  cachedState = state;
  return state;
}

export function resetDemoState(): DemoState {
  const seed = createDemoSeed();
  return saveDemoState(seed);
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function touchActivity(state: DemoState, iso = new Date()): DemoState {
  const y = iso.getFullYear();
  const m = String(iso.getMonth() + 1).padStart(2, "0");
  const d = String(iso.getDate()).padStart(2, "0");
  const date = `${y}-${m}-${d}`;
  if (state.activityDates.includes(date)) return state;
  return { ...state, activityDates: [date, ...state.activityDates] };
}

export function addDemoSymptomLog(
  state: DemoState,
  input: {
    severity: number;
    duration_minutes: number | null;
    triggers: string[];
    notes: string | null;
    customTriggerLabel?: string | null;
  },
): DemoState {
  let customTriggers = state.customTriggers;
  const triggers = [...input.triggers];
  if (input.customTriggerLabel) {
    const label = input.customTriggerLabel.trim();
    if (label) {
      triggers.push(label);
      if (!customTriggers.some((t) => t.label.toLowerCase() === label.toLowerCase())) {
        customTriggers = [
          { id: newId("demo-ct"), label },
          ...customTriggers,
        ];
      }
    }
  }

  const log: SymptomLog = {
    id: newId("demo-log"),
    severity: input.severity,
    duration_minutes: input.duration_minutes,
    triggers: [...new Set(triggers.map((t) => t.trim()).filter(Boolean))],
    notes: input.notes,
    logged_at: new Date().toISOString(),
    archived_at: null,
  };

  return touchActivity({
    ...state,
    customTriggers,
    symptomLogs: [log, ...state.symptomLogs],
  });
}

export function addDemoSession(
  state: DemoState,
  input: Omit<DemoSession, "id" | "completed_at"> & { completed_at?: string },
): DemoState {
  const session: DemoSession = {
    id: newId("demo-sess"),
    completed_at: input.completed_at ?? new Date().toISOString(),
    exercise_id: input.exercise_id,
    duration_seconds: input.duration_seconds,
    rep_count: input.rep_count,
    cv_confidence_avg: input.cv_confidence_avg,
    notes: input.notes,
  };
  return touchActivity({
    ...state,
    sessions: [session, ...state.sessions],
  });
}

export function startDemoProtocol(
  state: DemoState,
  input: {
    exercise_category: ExerciseCategory;
    protocol_label: string | null;
    adherence_target_per_week: number | null;
  },
): DemoState {
  const protocol: ProtocolEvent = {
    id: newId("demo-proto"),
    exercise_category: input.exercise_category,
    protocol_label: input.protocol_label,
    adherence_target_per_week: input.adherence_target_per_week,
    started_at: new Date().toISOString(),
    ended_at: null,
    notes: null,
  };
  return { ...state, protocols: [protocol, ...state.protocols] };
}

export function endDemoProtocol(state: DemoState, protocolId: string): DemoState {
  return {
    ...state,
    protocols: state.protocols.map((p) =>
      p.id === protocolId && !p.ended_at
        ? { ...p, ended_at: new Date().toISOString() }
        : p,
    ),
  };
}

export function stampDemoCalm(state: DemoState): DemoState {
  return touchActivity({
    ...state,
    calmCompletions: state.calmCompletions + 1,
  });
}

export function appendDemoInsightFromPool(state: DemoState): DemoState {
  const pool = DEMO_INSIGHT_POOL;
  if (pool.length === 0) return state;
  const idx = state.insightPoolIndex % pool.length;
  const sample = pool[idx]!;
  const insight: DemoInsight = {
    ...sample,
    id: newId("demo-insight"),
    generated_at: new Date().toISOString(),
  };
  return {
    ...state,
    insightPoolIndex: idx + 1,
    insights: [insight, ...state.insights],
  };
}

export function findDemoExercise(state: DemoState, id: string) {
  return state.exercises.find((e) => e.id === id) ?? null;
}

export type { CustomTrigger };
