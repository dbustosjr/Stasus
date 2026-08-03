"use client";

import { useState } from "react";
import { downloadExport } from "@/lib/export/client-download";

export function AdminExportButtons() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExport(path: string, name: string) {
    setBusy(true);
    setError(null);
    setStatus("Preparing…");
    try {
      const result = await downloadExport(path, name);
      setStatus(result === "shared" ? "Shared." : "Download started.");
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === "AbortError";
      if (!aborted) {
        setError(err instanceof Error ? err.message : "Export failed.");
        setStatus(null);
      } else {
        setStatus(null);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-[var(--stasus-ink)]">
        De-identified report
      </h2>
      <p className="mt-1 text-sm text-[var(--stasus-ink-muted)]">
        Counts and distributions only. No emails, names, user IDs, notes, or
        condition labels.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            void handleExport(
              "/api/admin/export/csv",
              "stasus-platform-deidentified.csv",
            )
          }
          className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-[var(--stasus-border)] px-5 text-sm font-medium text-[var(--stasus-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_16%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Download CSV
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            void handleExport(
              "/api/admin/export/pdf",
              "stasus-platform-deidentified.pdf",
            )
          }
          className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-[var(--stasus-border)] px-5 text-sm font-medium text-[var(--stasus-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_16%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Download PDF
        </button>
      </div>
      {(status || error) && (
        <p
          className={`mt-2 text-xs ${error ? "text-red-400" : "text-[var(--stasus-ink-muted)]"}`}
          role="status"
        >
          {error ?? status}
        </p>
      )}
    </div>
  );
}
