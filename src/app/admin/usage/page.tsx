import { notFound } from "next/navigation";
import { createAdminClient } from "@insforge/sdk";
import { requireUser } from "@/lib/auth/require-user";
import { computePlatformUsage } from "@/lib/insights/usage";

function adminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export default async function AdminUsagePage() {
  const { user } = await requireUser();
  const allow = adminEmails();
  if (!allow.size || !allow.has((user.email ?? "").toLowerCase())) {
    notFound();
  }

  const url = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const key = process.env.INSFORGE_API_KEY;
  if (!url || !key) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 text-[var(--stasus-ink)]">
        <h1 className="font-display text-2xl">Usage</h1>
        <p className="mt-2 text-[var(--stasus-ink-muted)]">
          Set INSFORGE_API_KEY for admin aggregates.
        </p>
      </main>
    );
  }

  const admin = createAdminClient({ baseUrl: url, apiKey: key });

  const { data: activityData, error: activityError } = await admin.database
    .from("user_activity_days")
    .select("user_id, activity_date")
    .limit(5000);

  const { data: profilesData } = await admin.database
    .from("profiles")
    .select("id, timezone")
    .limit(2000);

  const rows = (activityData ?? []).map(
    (r: { user_id: string; activity_date: string }) => ({
      user_id: String(r.user_id),
      activity_date: String(r.activity_date),
    }),
  );

  const timezones: Record<string, string> = {};
  for (const p of profilesData ?? []) {
    const row = p as { id: string; timezone?: string };
    timezones[String(row.id)] = row.timezone || "UTC";
  }

  const usage = computePlatformUsage(rows, timezones);

  return (
    <main className="mx-auto flex min-h-full max-w-3xl flex-col gap-6 bg-[var(--stasus-bg)] px-4 py-10 text-[var(--stasus-ink)]">
      <div>
        <h1 className="font-display text-3xl font-medium">Platform usage</h1>
        <p className="mt-2 text-sm text-[var(--stasus-ink-muted)]">
          Meaningful actions only (symptom log, exercise practice, calm
          breathing). Counts use each user’s local calendar day.
        </p>
      </div>
      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="border-y border-[var(--stasus-border)] py-4">
          <dt className="text-sm text-[var(--stasus-ink-muted)]">DAU</dt>
          <dd className="mt-1 text-3xl font-medium">{usage.dau}</dd>
        </div>
        <div className="border-y border-[var(--stasus-border)] py-4">
          <dt className="text-sm text-[var(--stasus-ink-muted)]">WAU</dt>
          <dd className="mt-1 text-3xl font-medium">{usage.wau}</dd>
        </div>
        <div className="border-y border-[var(--stasus-border)] py-4">
          <dt className="text-sm text-[var(--stasus-ink-muted)]">MAU</dt>
          <dd className="mt-1 text-3xl font-medium">{usage.mau}</dd>
        </div>
      </dl>
      {activityError ? (
        <p className="text-sm text-red-300">
          Could not load activity: {activityError.message}
        </p>
      ) : null}
    </main>
  );
}
