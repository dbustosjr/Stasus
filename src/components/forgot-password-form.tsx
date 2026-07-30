"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  confirmPasswordReset,
  requestPasswordReset,
  type ResetPasswordState,
} from "@/app/actions/auth";
import { PasswordField } from "@/components/password-field";

const initial: ResetPasswordState = { error: null, step: "request" };

export function ForgotPasswordForm() {
  const [requestState, requestAction, requestPending] = useActionState(
    requestPasswordReset,
    initial,
  );
  const [resetState, resetAction, resetPending] = useActionState(
    confirmPasswordReset,
    initial,
  );

  const step =
    resetState.step === "done"
      ? "done"
      : resetState.step === "reset" || requestState.step === "reset"
        ? "reset"
        : "request";
  const email = resetState.email ?? requestState.email ?? "";
  const error =
    step === "reset"
      ? resetState.error ?? (requestState.step === "reset" ? null : requestState.error)
      : requestState.error;
  const info =
    step === "done"
      ? resetState.info
      : step === "reset"
        ? resetState.info ?? requestState.info
        : null;

  if (step === "done") {
    return (
      <div className="flex w-full max-w-md flex-col gap-4">
        <p className="text-sm text-[var(--stasus-ink-muted)]">
          {info ?? "Password updated."}
        </p>
        <Link
          href="/login"
          className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--stasus-aqua)] px-6 text-base font-semibold text-[#001219]"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  if (step === "reset") {
    return (
      <form action={resetAction} className="flex w-full max-w-md flex-col gap-4">
        <p className="text-sm text-[var(--stasus-ink-muted)]">
          {info ??
            "Enter the code from your email and choose a new password."}
        </p>
        <input type="hidden" name="email" value={email} />
        <p className="text-sm text-[var(--stasus-ink)]">
          Resetting <span className="font-medium">{email}</span>
        </p>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--stasus-ink)]">
          Reset code
          <input
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            minLength={6}
            maxLength={8}
            pattern="[0-9]*"
            className="h-12 rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-4 text-base tracking-[0.2em] text-[var(--stasus-ink)] outline-none focus-visible:border-[var(--stasus-teal-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--stasus-aqua)]"
          />
        </label>
        <PasswordField
          name="password"
          autoComplete="new-password"
          label="New password"
        />
        <PasswordField
          name="confirm_password"
          autoComplete="new-password"
          label="Confirm new password"
        />
        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={resetPending}
          className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--stasus-aqua)] px-6 text-base font-semibold text-[#001219] disabled:opacity-60"
        >
          {resetPending ? "Updating…" : "Update password"}
        </button>
        <p className="text-sm text-[var(--stasus-ink-muted)]">
          <Link
            href="/login"
            className="font-medium text-[var(--stasus-aqua)] underline-offset-2 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </form>
    );
  }

  return (
    <form action={requestAction} className="flex w-full max-w-md flex-col gap-4">
      <p className="text-sm text-[var(--stasus-ink-muted)]">
        Enter the email you used to sign up. We’ll send a reset code if an
        account exists.
      </p>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--stasus-ink)]">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-12 rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-4 text-base font-normal text-[var(--stasus-ink)] outline-none focus-visible:border-[var(--stasus-teal-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--stasus-aqua)]"
        />
      </label>
      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={requestPending}
        className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--stasus-aqua)] px-6 text-base font-semibold text-[#001219] disabled:opacity-60"
      >
        {requestPending ? "Sending…" : "Send reset code"}
      </button>
      <p className="text-sm text-[var(--stasus-ink-muted)]">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-medium text-[var(--stasus-aqua)] underline-offset-2 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
