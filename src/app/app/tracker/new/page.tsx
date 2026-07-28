import Link from "next/link";
import { requireOnboarded } from "@/lib/auth/require-onboarded";
import { AppShell } from "@/components/app-shell";
import { SymptomLogForm } from "@/components/symptom-log-form";
import type { CustomTrigger } from "@/lib/tracker/types";

export default async function NewTrackerEntryPage() {
  const { insforge, user } = await requireOnboarded();

  const { data } = await insforge.database
    .from("custom_triggers")
    .select("id, label")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const customTriggers: CustomTrigger[] = (data ?? []).map((row) => ({
    id: String((row as { id: string }).id),
    label: String((row as { label: string }).label),
  }));

  return (
    <AppShell email={user.email} active="tracker">
      <div>
        <Link
          href="/app/tracker"
          className="text-sm font-medium text-[var(--stasus-ink-muted)] hover:text-[var(--stasus-ink)]"
        >
          ← Back to tracker
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--stasus-ink)]">
          New entry
        </h1>
        <p className="mt-2 max-w-xl text-[var(--stasus-ink-muted)]">
          Capture what you notice. No reactive coaching here — just your
          record. If checking urges spike afterward, open Calm tools once.
        </p>
      </div>

      <p className="max-w-xl text-sm text-[var(--stasus-ink-muted)]">
        Emergency: sudden severe vertigo with slurred speech, facial drooping,
        limb weakness, or sudden severe headache → seek emergency care.{" "}
        <Link
          href="/app/calm"
          className="font-semibold text-[var(--stasus-teal)] dark:text-[var(--stasus-aqua)]"
        >
          Calm tools
        </Link>
      </p>

      <div className="max-w-xl rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-6 py-6">
        <SymptomLogForm customTriggers={customTriggers} />
      </div>
    </AppShell>
  );
}
