import { requireUser } from "@/lib/auth/require-user";
import { isAdminEmail } from "@/lib/auth/admin-emails";
import { AdminExportButtons } from "@/components/admin-export-buttons";
import { fetchDeidentifiedPlatformReport } from "@/lib/admin/fetch-platform-report";

export default async function AdminUsagePage() {
  const { user } = await requireUser();
  const signedIn = (user.email ?? "").trim().toLowerCase();

  if (!isAdminEmail(user.email)) {
    return (
      <>
        <div>
          <h1 className="font-display text-2xl text-[var(--stasus-ink)]">
            Admin access needed
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--stasus-ink-muted)]">
            This page is limited to emails listed in{" "}
            <code className="text-[var(--stasus-ink)]">ADMIN_EMAILS</code>.
          </p>
          <p className="mt-4 text-sm text-[var(--stasus-ink-muted)]">
            Signed in as{" "}
            <span className="font-medium text-[var(--stasus-ink)]">
              {signedIn || "(no email on session)"}
            </span>
          </p>
        </div>
      </>
    );
  }

  const { report, error } = await fetchDeidentifiedPlatformReport();

  return (
    <>
      <div>
        <h1 className="font-display text-3xl font-medium text-[var(--stasus-ink)]">
          Personal Admin
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--stasus-ink-muted)]">
          De-identified product usage for Stasus ops. No emails, names, user
          IDs, notes, or condition labels. Meaningful activity uses each user’s
          local calendar day.
        </p>
      </div>

      {error || !report ? (
        <p className="text-sm text-red-300">
          Could not load analytics: {error ?? "Unknown error"}
        </p>
      ) : (
        <>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div className="border-y border-[var(--stasus-border)] py-4">
              <dt className="text-sm text-[var(--stasus-ink-muted)]">DAU</dt>
              <dd className="mt-1 text-3xl font-medium text-[var(--stasus-ink)]">
                {report.usage.dau}
              </dd>
            </div>
            <div className="border-y border-[var(--stasus-border)] py-4">
              <dt className="text-sm text-[var(--stasus-ink-muted)]">WAU</dt>
              <dd className="mt-1 text-3xl font-medium text-[var(--stasus-ink)]">
                {report.usage.wau}
              </dd>
            </div>
            <div className="border-y border-[var(--stasus-border)] py-4">
              <dt className="text-sm text-[var(--stasus-ink-muted)]">MAU</dt>
              <dd className="mt-1 text-3xl font-medium text-[var(--stasus-ink)]">
                {report.usage.mau}
              </dd>
            </div>
          </dl>

          <section className="border-y border-[var(--stasus-border)] py-5">
            <h2 className="text-sm font-semibold text-[var(--stasus-ink)]">
              Totals
            </h2>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--stasus-ink-muted)]">Profiles</dt>
                <dd className="font-medium text-[var(--stasus-ink)]">
                  {report.totals.profileCount}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--stasus-ink-muted)]">Symptom logs</dt>
                <dd className="font-medium text-[var(--stasus-ink)]">
                  {report.totals.symptomLogCount}{" "}
                  <span className="text-[var(--stasus-ink-muted)]">
                    ({report.totals.symptomLogCount30d} / 30d)
                  </span>
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--stasus-ink-muted)]">
                  Exercise sessions
                </dt>
                <dd className="font-medium text-[var(--stasus-ink)]">
                  {report.totals.exerciseSessionCount}{" "}
                  <span className="text-[var(--stasus-ink-muted)]">
                    ({report.totals.exerciseSessionCount30d} / 30d)
                  </span>
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--stasus-ink-muted)]">Insights</dt>
                <dd className="font-medium text-[var(--stasus-ink)]">
                  {report.totals.insightCount}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--stasus-ink-muted)]">
                  Active protocols
                </dt>
                <dd className="font-medium text-[var(--stasus-ink)]">
                  {report.totals.activeProtocolCount}{" "}
                  <span className="text-[var(--stasus-ink-muted)]">
                    / {report.totals.protocolEventCount} total
                  </span>
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--stasus-ink-muted)]">
                  Research consent active
                </dt>
                <dd className="font-medium text-[var(--stasus-ink)]">
                  {report.totals.researchConsentActiveCount}{" "}
                  <span className="text-[var(--stasus-ink-muted)]">
                    / {report.totals.researchConsentPromptedCount} prompted
                  </span>
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--stasus-ink-muted)]">
                  Avg severity (all / 30d)
                </dt>
                <dd className="font-medium text-[var(--stasus-ink)]">
                  {report.severity.averageSeverity ?? "n/a"} /{" "}
                  {report.severity.averageSeverity30d ?? "n/a"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold text-[var(--stasus-ink)]">
                Sessions by category
              </h2>
              <ul className="mt-2 space-y-1 text-sm text-[var(--stasus-ink-muted)]">
                {report.sessionsByCategory.length ? (
                  report.sessionsByCategory.map((r) => (
                    <li key={r.category} className="flex justify-between gap-3">
                      <span>{r.label}</span>
                      <span className="font-medium text-[var(--stasus-ink)]">
                        {r.count}
                      </span>
                    </li>
                  ))
                ) : (
                  <li>No sessions yet.</li>
                )}
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--stasus-ink)]">
                Activity source days
              </h2>
              <ul className="mt-2 space-y-1 text-sm text-[var(--stasus-ink-muted)]">
                {report.activitySourceDays.length ? (
                  report.activitySourceDays.map((r) => (
                    <li key={r.source} className="flex justify-between gap-3">
                      <span>{r.source}</span>
                      <span className="font-medium text-[var(--stasus-ink)]">
                        {r.dayCount}
                      </span>
                    </li>
                  ))
                ) : (
                  <li>No activity days yet.</li>
                )}
              </ul>
            </div>
          </section>

          <AdminExportButtons />
        </>
      )}
    </>
  );
}
