"use client";

import { useEffect, useId, useRef, useState } from "react";
import { signOut } from "@/app/actions/auth";
import { downloadExport } from "@/lib/export/client-download";

type AccountMenuProps = {
  email?: string | null;
};

export function AccountMenu({ email }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleExport(path: string, fallbackName: string) {
    setBusy(true);
    setError(null);
    setStatus("Opening share sheet…");
    try {
      const result = await downloadExport(path, fallbackName);
      setStatus(result === "shared" ? "Shared." : "Download started.");
    } catch (err) {
      const aborted =
        err instanceof DOMException && err.name === "AbortError";
      if (aborted) {
        setStatus(null);
        setError(null);
      } else {
        setStatus(null);
        setError(err instanceof Error ? err.message : "Export failed.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex min-h-11 shrink-0 items-center rounded-full px-3 py-2 text-sm font-medium text-[var(--stasus-ink-muted)] transition-colors hover:bg-[var(--stasus-surface)] hover:text-[var(--stasus-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)] active:scale-[0.98] sm:px-4"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => {
          setOpen((v) => !v);
          setStatus(null);
          setError(null);
        }}
      >
        Account
      </button>
      <div
        id={menuId}
        role="menu"
        aria-label="Account"
        hidden={!open}
        className="absolute right-0 z-30 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] p-2 shadow-lg"
      >
        {email ? (
          <p className="truncate px-3 py-2 text-xs text-[var(--stasus-ink-muted)]">
            {email}
          </p>
        ) : null}
        <span className="block px-3 pb-1 text-xs leading-relaxed text-[var(--stasus-ink-muted)]">
          Your symptom logs and practice sessions. Includes archived entries.
        </span>
        <button
          type="button"
          role="menuitem"
          disabled={busy}
          tabIndex={open ? 0 : -1}
          className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--stasus-ink)] hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_16%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--stasus-aqua)] disabled:opacity-60"
          onClick={() => void handleExport("/api/export/csv", "stasus-export.csv")}
        >
          Download CSV
        </button>
        <button
          type="button"
          role="menuitem"
          disabled={busy}
          tabIndex={open ? 0 : -1}
          className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--stasus-ink)] hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_16%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--stasus-aqua)] disabled:opacity-60"
          onClick={() => void handleExport("/api/export/pdf", "stasus-export.pdf")}
        >
          Download PDF
        </button>
        {(status || error) && (
          <p
            className={`px-3 py-1.5 text-xs ${
              error
                ? "text-red-400"
                : "text-[var(--stasus-ink-muted)]"
            }`}
            role="status"
          >
            {error ?? status}
          </p>
        )}
        <div className="my-1 border-t border-[var(--stasus-border)]" />
        <form action={signOut}>
          <button
            type="submit"
            role="menuitem"
            tabIndex={open ? 0 : -1}
            className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--stasus-ink)] hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_16%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--stasus-aqua)] active:scale-[0.98]"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
