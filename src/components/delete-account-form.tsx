"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  deleteAccount,
  type DeleteAccountState,
} from "@/app/actions/account";

const initial: DeleteAccountState = { error: null };

export function DeleteAccountForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(deleteAccount, initial);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      panelRef.current?.querySelector<HTMLElement>("input,button")?.focus();
      return;
    }
    if (wasOpen.current) {
      triggerRef.current?.focus();
    }
  }, [open]);

  if (!open) {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 text-sm font-medium text-red-200 underline-offset-2 hover:text-red-100 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
      >
        Delete account
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      className="mt-4 rounded-2xl border border-red-900/60 bg-red-950/30 px-4 py-4"
      role="region"
      aria-labelledby="delete-account-heading"
    >
      <h3
        id="delete-account-heading"
        className="text-sm font-semibold text-[var(--stasus-ink)]"
      >
        Delete your account
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--stasus-ink-muted)]">
        This permanently removes your Stasus account and all associated data
        (logs, sessions, insights, and profile). This cannot be undone.
      </p>
      <form action={action} className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--stasus-ink)]">
          Type DELETE to confirm
          <input
            name="confirm"
            type="text"
            autoComplete="off"
            required
            placeholder="DELETE"
            className="h-11 rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-bg)] px-3 text-base font-normal text-[var(--stasus-ink)] outline-none focus-visible:border-red-400 focus-visible:ring-2 focus-visible:ring-red-400/40"
          />
        </label>
        {state.error ? (
          <p role="alert" className="text-sm text-red-200">
            {state.error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-red-500/90 px-5 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-200 disabled:opacity-60"
          >
            {pending ? "Deleting…" : "Permanently delete"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setOpen(false)}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--stasus-border)] px-5 text-sm font-medium text-[var(--stasus-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
