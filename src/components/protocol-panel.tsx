"use client";

import { useActionState } from "react";
import {
  endProtocol,
  startProtocol,
  type ProtocolActionState,
} from "@/app/actions/protocols";
import { EXERCISE_CATEGORIES } from "@/lib/exercises/types";
import {
  protocolCategoryLabel,
  type ProtocolEvent,
} from "@/lib/protocols/types";

const initial: ProtocolActionState = { error: null };

type ProtocolPanelProps = {
  active: ProtocolEvent[];
  recentEnded?: ProtocolEvent[];
};

export function ProtocolPanel({ active, recentEnded = [] }: ProtocolPanelProps) {
  const [startState, startAction, startPending] = useActionState(
    startProtocol,
    initial,
  );
  const [endState, endAction, endPending] = useActionState(endProtocol, initial);

  return (
    <section className="border-y border-[var(--stasus-border)] py-5">
      <h2 className="text-sm font-semibold tracking-wide text-[var(--stasus-ink)]">
        Practice protocol
      </h2>
      <p className="mt-1 text-sm text-[var(--stasus-ink-muted)]">
        Mark when you start a focused practice window. Later notes can compare
        how things felt before and after.
      </p>

      {active.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {active.map((p) => (
            <li
              key={p.id}
              className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-4 py-3"
            >
              <p className="text-sm font-medium text-[var(--stasus-ink)]">
                {p.protocol_label || protocolCategoryLabel(p.exercise_category)}
              </p>
              <p className="mt-1 text-xs text-[var(--stasus-ink-muted)]">
                {protocolCategoryLabel(p.exercise_category)} · started{" "}
                {new Date(p.started_at).toLocaleDateString()}
                {p.adherence_target_per_week
                  ? ` · aim ${p.adherence_target_per_week}/week`
                  : null}
              </p>
              <form action={endAction} className="mt-3">
                <input type="hidden" name="protocol_id" value={p.id} />
                <button
                  type="submit"
                  disabled={endPending}
                  className="inline-flex min-h-10 cursor-pointer items-center rounded-full border border-[var(--stasus-border)] px-4 text-sm font-medium text-[var(--stasus-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_16%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {endPending ? "Ending…" : "End protocol"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-[var(--stasus-ink-muted)]">
          No open protocol right now.
        </p>
      )}

      {(startState.error || endState.error) && (
        <p role="alert" className="mt-3 text-sm text-red-300">
          {startState.error || endState.error}
        </p>
      )}

      <form action={startAction} className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--stasus-ink)] sm:col-span-2">
          Category
          <select
            name="exercise_category"
            required
            defaultValue="gaze_stabilization"
            className="h-11 rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-bg)] px-3 text-base font-normal text-[var(--stasus-ink)] outline-none focus-visible:border-[var(--stasus-aqua)] focus-visible:ring-2 focus-visible:ring-[var(--stasus-aqua)]/40"
          >
            {EXERCISE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {protocolCategoryLabel(c)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--stasus-ink)]">
          Label (optional)
          <input
            name="protocol_label"
            type="text"
            maxLength={120}
            placeholder="e.g. Gaze focus — week 1"
            className="h-11 rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-bg)] px-3 text-base font-normal text-[var(--stasus-ink)] outline-none focus-visible:border-[var(--stasus-aqua)] focus-visible:ring-2 focus-visible:ring-[var(--stasus-aqua)]/40"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--stasus-ink)]">
          Sessions / week target (optional)
          <input
            name="adherence_target_per_week"
            type="number"
            min={1}
            max={21}
            placeholder="3"
            className="h-11 rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-bg)] px-3 text-base font-normal text-[var(--stasus-ink)] outline-none focus-visible:border-[var(--stasus-aqua)] focus-visible:ring-2 focus-visible:ring-[var(--stasus-aqua)]/40"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--stasus-ink)] sm:col-span-2">
          Notes (optional)
          <input
            name="notes"
            type="text"
            maxLength={500}
            placeholder="Anything you want to remember about this window"
            className="h-11 rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-bg)] px-3 text-base font-normal text-[var(--stasus-ink)] outline-none focus-visible:border-[var(--stasus-aqua)] focus-visible:ring-2 focus-visible:ring-[var(--stasus-aqua)]/40"
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={startPending}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-[var(--stasus-aqua)] px-6 text-sm font-semibold text-[#001219] transition-colors hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_82%,white)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[var(--stasus-aqua)]"
          >
            {startPending ? "Starting…" : "Start protocol"}
          </button>
        </div>
      </form>

      {recentEnded.length > 0 ? (
        <div className="mt-5">
          <h3 className="text-xs font-semibold tracking-wide text-[var(--stasus-ink-muted)] uppercase">
            Recently ended
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-[var(--stasus-ink-muted)]">
            {recentEnded.map((p) => (
              <li key={p.id}>
                {p.protocol_label || protocolCategoryLabel(p.exercise_category)}{" "}
                · ended{" "}
                {p.ended_at
                  ? new Date(p.ended_at).toLocaleDateString()
                  : "—"}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
