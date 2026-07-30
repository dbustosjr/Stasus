"use client";

import { useEffect, useId, useRef, useState } from "react";

export function ExportMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const helpId = useId();

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

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex min-h-11 shrink-0 items-center rounded-full px-3 py-2 text-sm font-medium text-[var(--stasus-ink-muted)] transition-colors hover:bg-[var(--stasus-surface)] hover:text-[var(--stasus-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)] sm:px-4"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-describedby={helpId}
        onClick={() => setOpen((v) => !v)}
      >
        Export
      </button>
      <span id={helpId} className="sr-only">
        Download your symptom logs and practice sessions. Includes archived
        entries.
      </span>
      <div
        id={menuId}
        role="menu"
        aria-label="Export formats"
        hidden={!open}
        className="absolute left-0 z-30 mt-2 min-w-[12rem] rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] p-2 shadow-lg"
      >
        <span className="block px-3 py-2 text-xs leading-relaxed text-[var(--stasus-ink-muted)]">
          Your symptom logs and practice sessions. Includes archived entries.
        </span>
        <a
          role="menuitem"
          href="/api/export/csv"
          tabIndex={open ? 0 : -1}
          className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--stasus-ink)] hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_16%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--stasus-aqua)]"
          onClick={() => setOpen(false)}
        >
          Download CSV
        </a>
        <a
          role="menuitem"
          href="/api/export/pdf"
          tabIndex={open ? 0 : -1}
          className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--stasus-ink)] hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_16%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--stasus-aqua)]"
          onClick={() => setOpen(false)}
        >
          Download PDF
        </a>
      </div>
    </div>
  );
}
