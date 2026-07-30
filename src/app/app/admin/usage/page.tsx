import { createAdminClient } from "@insforge/sdk";
import { requireUser } from "@/lib/auth/require-user";
import { AppShell } from "@/components/app-shell";
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
  const signedIn = (user.email ?? "").trim().toLowerCase();

  if (!allow.size || !allow.has(signedIn)) {
    return (
      <AppShell email={user.email}>
        <div>
          <h1 className="font-display text-2xl text-[var(--stasus-ink)]">
            Admin access needed
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--stasus-ink-muted)]">
            This page is limited to emails listed in{" "}
            <code className="text-[var(--stasus-ink)]">ADMIN_EMAILS</code> in{" "}
            <code className="text-[var(--stasus-ink)]">.env.local</code>.
          </p>
          <dl className="mt-6 space-y-2 text-sm">
            <div>
              <dt className="text-[var(--stasus-ink-muted)]">Signed in as</dt>
              <dd className="font-medium text-[var(--stasus-ink)]">
                {signedIn || "(no email on session)"}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--stasus-ink-muted)]">
                ADMIN_EMAILS loaded
              </dt>
              <dd className="font-medium text-[var(--stasus-ink)]">
                {allow.size
                  ? `${allow.size} address(es)`
                  : "none — env empty or server needs restart"}
              </dd>
            </div>
          </dl>
        </div>
      </AppShell>
    );
  }

  const url = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const key = process.env.INSFORGE_API_KEY;
  if (!url || !key) {
    return (
      <AppShell email={user.email}>
        <div>
          <h1 className="font-display text-2xl text-[var(--stasus-ink)]">
            Usage
          </h1>
          <p className="mt-2 text-sm text-[var(--stasus-ink-muted)]">
            Set INSFORGE_API_KEY for admin aggregates.
          </p>
        </div>
      </AppShell>
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
    <AppShell email={user.email}>
      <div>
        <h1 className="font-display text-3xl font-medium text-[var(--stasus-ink)]">
          Platform usage
        </h1>
        <p className="mt-2 text-sm text-[var(--stasus-ink-muted)]">
          Meaningful actions only (symptom log, exercise practice, calm
          breathing). Counts use each user’s local calendar day.
        </p>
      </div>
      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="border-y border-[var(--stasus-border)] py-4">
          <dt className="text-sm text-[var(--stasus-ink-muted)]">DAU</dt>
          <dd className="mt-1 text-3xl font-medium text-[var(--stasus-ink)]">
            {usage.dau}
          </dd>
        </div>
        <div className="border-y border-[var(--stasus-border)] py-4">
          <dt className="text-sm text-[var(--stasus-ink-muted)]">WAU</dt>
          <dd className="mt-1 text-3xl font-medium text-[var(--stasus-ink)]">
            {usage.wau}
          </dd>
        </div>
        <div className="border-y border-[var(--stasus-border)] py-4">
          <dt className="text-sm text-[var(--stasus-ink-muted)]">MAU</dt>
          <dd className="mt-1 text-3xl font-medium text-[var(--stasus-ink)]">
            {usage.mau}
          </dd>
        </div>
      </dl>
      {activityError ? (
        <p className="text-sm text-red-300">
          Could not load activity: {activityError.message}
        </p>
      ) : null}
    </AppShell>
  );
}
