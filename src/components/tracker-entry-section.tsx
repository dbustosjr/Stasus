"use client";

import { useId, useState, type ReactNode } from "react";

type Props = {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: ReactNode;
  empty: ReactNode;
};

export function TrackerEntrySection({
  title,
  count,
  defaultOpen = false,
  children,
  empty,
}: Props) {
  const panelId = useId();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)]">
      <h2>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_10%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--stasus-aqua)]"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-base font-semibold text-[var(--stasus-ink)]">
            {title}
            <span className="ml-2 font-normal text-[var(--stasus-ink-muted)]">
              ({count})
            </span>
          </span>
          <span
            aria-hidden
            className={`text-[var(--stasus-ink-muted)] transition-transform ${open ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>
      </h2>
      {open ? (
        <div id={panelId} className="border-t border-[var(--stasus-border)] px-5 py-4">
          {count === 0 ? empty : <ul className="flex flex-col gap-3">{children}</ul>}
        </div>
      ) : null}
    </section>
  );
}
