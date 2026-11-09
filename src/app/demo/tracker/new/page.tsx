"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemo } from "@/components/demo/demo-provider";
import { SymptomLogForm } from "@/components/symptom-log-form";
import type { TrackerFormState } from "@/app/actions/tracker";
import { evaluateRedFlag } from "@/lib/ai/red-flag";
import { PRESET_TRIGGERS } from "@/lib/tracker/types";
import { demoPath } from "@/lib/demo/paths";

const presetIds = new Set(PRESET_TRIGGERS.map((t) => t.id));

export default function DemoNewTrackerEntryPage() {
  const router = useRouter();
  const { state, addLog } = useDemo();

  async function demoCreateLog(
    _prev: TrackerFormState,
    formData: FormData,
  ): Promise<TrackerFormState> {
    const severity = Number.parseInt(String(formData.get("severity") ?? ""), 10);
    if (!Number.isFinite(severity) || severity < 1 || severity > 10) {
      return { error: "Severity must be a number from 1 to 10." };
    }

    const durationRaw = String(formData.get("duration_minutes") ?? "").trim();
    let duration_minutes: number | null = null;
    if (durationRaw) {
      duration_minutes = Number.parseInt(durationRaw, 10);
      if (!Number.isFinite(duration_minutes) || duration_minutes < 0) {
        return { error: "Duration must be 0 or more minutes." };
      }
    }

    const notes = String(formData.get("notes") ?? "").trim() || null;
    const selected = formData.getAll("triggers").map(String);
    const customNew = String(formData.get("custom_trigger") ?? "").trim();
    const redFlagSignals = formData.getAll("red_flag_signals").map(String);

    const triggers: string[] = [];
    for (const value of selected) {
      if (presetIds.has(value as (typeof PRESET_TRIGGERS)[number]["id"])) {
        triggers.push(value);
      } else if (value.startsWith("custom:")) {
        const label = value.slice("custom:".length).trim();
        if (label) triggers.push(label);
      }
    }

    const redFlag = evaluateRedFlag(redFlagSignals);
    if (redFlag.triggered) {
      router.push("/emergency");
      return { error: null };
    }

    addLog({
      severity,
      duration_minutes,
      triggers,
      notes,
      customTriggerLabel: customNew || null,
    });
    router.push(demoPath("/tracker"));
    return { error: null };
  }

  return (
    <>
      <div>
        <Link
          href={demoPath("/tracker")}
          className="text-sm font-medium text-[var(--stasus-ink-muted)] hover:text-[var(--stasus-ink)]"
        >
          ← Back to tracker
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--stasus-ink)]">
          New entry
        </h1>
        <p className="mt-2 max-w-xl text-[var(--stasus-ink-muted)]">
          Write down what you noticed. There is no coaching on this screen, just
          your record. If checking urges spike afterward, open Calm once and
          leave it there.
        </p>
      </div>

      <p className="max-w-xl text-sm text-[var(--stasus-ink-muted)]">
        Emergency: sudden severe vertigo with slurred speech, facial drooping,
        weakness, or sudden severe headache needs emergency care — not this
        form.
      </p>

      <SymptomLogForm
        customTriggers={state.customTriggers}
        action={demoCreateLog}
      />
    </>
  );
}
