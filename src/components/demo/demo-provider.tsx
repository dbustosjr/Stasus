"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  addDemoSession,
  addDemoSymptomLog,
  appendDemoInsightFromPool,
  endDemoProtocol,
  getDemoServerSnapshot,
  getDemoState,
  resetDemoState,
  saveDemoState,
  stampDemoCalm,
  startDemoProtocol,
} from "@/lib/demo/store";
import type { DemoState } from "@/lib/demo/types";
import type { ExerciseCategory } from "@/lib/exercises/types";

type DemoContextValue = {
  state: DemoState;
  refresh: () => void;
  reset: () => void;
  addLog: (input: Parameters<typeof addDemoSymptomLog>[1]) => void;
  addSession: (input: Parameters<typeof addDemoSession>[1]) => void;
  startProtocol: (input: {
    exercise_category: ExerciseCategory;
    protocol_label: string | null;
    adherence_target_per_week: number | null;
  }) => void;
  endProtocol: (protocolId: string) => void;
  stampCalm: () => void;
  generateInsight: () => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener("stasus-demo-updated", handler);
  return () => window.removeEventListener("stasus-demo-updated", handler);
}

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("stasus-demo-updated"));
  }
}

function readSnapshot(): DemoState {
  return getDemoState();
}

function readServerSnapshot(): DemoState {
  return getDemoServerSnapshot();
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(
    subscribe,
    readSnapshot,
    readServerSnapshot,
  );

  const refresh = useCallback(() => {
    emit();
  }, []);

  const value = useMemo<DemoContextValue>(
    () => ({
      state,
      refresh,
      reset: () => {
        resetDemoState();
        refresh();
      },
      addLog: (input) => {
        saveDemoState(addDemoSymptomLog(getDemoState(), input));
        refresh();
      },
      addSession: (input) => {
        saveDemoState(addDemoSession(getDemoState(), input));
        refresh();
      },
      startProtocol: (input) => {
        saveDemoState(startDemoProtocol(getDemoState(), input));
        refresh();
      },
      endProtocol: (protocolId) => {
        saveDemoState(endDemoProtocol(getDemoState(), protocolId));
        refresh();
      },
      stampCalm: () => {
        saveDemoState(stampDemoCalm(getDemoState()));
        refresh();
      },
      generateInsight: () => {
        saveDemoState(appendDemoInsightFromPool(getDemoState()));
        refresh();
      },
    }),
    [state, refresh],
  );

  return (
    <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
  );
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error("useDemo must be used within DemoProvider");
  }
  return ctx;
}
