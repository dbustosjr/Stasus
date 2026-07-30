"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  resendSignupCode,
  signIn,
  signUp,
  verifySignupEmail,
  type AuthFormState,
} from "@/app/actions/auth";
import { PasswordField } from "@/components/password-field";

const initial: AuthFormState = { error: null };

type AuthFormProps = {
  mode: "signin" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const primaryAction = mode === "signin" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(primaryAction, initial);
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifySignupEmail,
    initial,
  );
  const [resendState, resendAction, resendPending] = useActionState(
    resendSignupCode,
    initial,
  );

  const verifyEmail =
    verifyState.email ?? resendState.email ?? state.email ?? "";
  const showVerify = Boolean(
    verifyState.needsVerification ||
      resendState.needsVerification ||
      state.needsVerification,
  );
  const bannerError =
    (showVerify
      ? verifyState.error ?? resendState.error ?? state.error
      : state.error) ?? null;
  const bannerInfo =
    (showVerify
      ? verifyState.info ?? resendState.info ?? state.info
      : state.info) ?? null;

  if (showVerify) {
    return (
      <div className="flex w-full max-w-md flex-col gap-4">
        <p className="text-sm text-[var(--stasus-ink-muted)]">
          {bannerInfo ??
            "Enter the 6-digit code we emailed you to verify your account."}
        </p>
        <p className="text-sm text-[var(--stasus-ink)]">
          Code sent to <span className="font-medium">{verifyEmail}</span>
        </p>
        <form action={verifyAction} className="flex flex-col gap-4">
          <input type="hidden" name="email" value={verifyEmail} />
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--stasus-ink)]">
            Verification code
            <input
              name="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              minLength={6}
              maxLength={8}
              pattern="[0-9]*"
              className="h-12 rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-4 text-base font-normal tracking-[0.2em] text-[var(--stasus-ink)] outline-none focus-visible:border-[var(--stasus-teal-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--stasus-aqua)]"
            />
          </label>

          {bannerError ? (
            <p
              role="alert"
              className="rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200"
            >
              {bannerError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={verifyPending}
            className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--stasus-aqua)] px-6 text-base font-semibold text-[#001219] transition-colors disabled:opacity-60"
          >
            {verifyPending ? "Verifying…" : "Verify email"}
          </button>
        </form>

        <form action={resendAction}>
          <input type="hidden" name="email" value={verifyEmail} />
          <button
            type="submit"
            disabled={resendPending}
            className="text-sm font-medium text-[var(--stasus-aqua)] underline-offset-2 hover:underline disabled:opacity-60"
          >
            {resendPending ? "Sending…" : "Resend code"}
          </button>
        </form>

        <p className="text-sm text-[var(--stasus-ink-muted)]">
          Wrong email?{" "}
          <Link
            href="/signup"
            className="font-medium text-[var(--stasus-aqua)] underline-offset-2 hover:underline"
          >
            Start over
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--stasus-ink)]">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email ?? ""}
          className="h-12 rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-4 text-base font-normal text-[var(--stasus-ink)] outline-none focus-visible:border-[var(--stasus-teal-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--stasus-aqua)]"
        />
      </label>
      <PasswordField
        autoComplete={mode === "signin" ? "current-password" : "new-password"}
        label="Password"
      />

      {mode === "signin" ? (
        <p className="-mt-1 text-right text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-[var(--stasus-aqua)] underline-offset-2 hover:underline"
          >
            Forgot password?
          </Link>
        </p>
      ) : null}

      {state.error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--stasus-aqua)] px-6 text-base font-semibold text-[#001219] transition-colors disabled:opacity-60"
      >
        {pending
          ? "Working…"
          : mode === "signin"
            ? "Sign in"
            : "Create account"}
      </button>

      <p className="text-sm text-[var(--stasus-ink-muted)]">
        {mode === "signin" ? (
          <>
            New here?{" "}
            <Link
              href="/signup"
              className="font-medium text-[var(--stasus-aqua)] underline-offset-2 hover:underline"
            >
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[var(--stasus-aqua)] underline-offset-2 hover:underline"
            >
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
