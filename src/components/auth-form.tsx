"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  signIn,
  signUp,
  type AuthFormState,
} from "@/app/actions/auth";

const initial: AuthFormState = { error: null };

type AuthFormProps = {
  mode: "signin" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const action = mode === "signin" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--stasus-ink)]">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-12 rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-mist)] px-4 text-base font-normal text-[var(--stasus-ink)] outline-none focus-visible:border-[var(--stasus-teal-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--stasus-aqua)] dark:bg-[var(--stasus-surface)]"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--stasus-ink)]">
        Password
        <input
          name="password"
          type="password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          required
          minLength={8}
          className="h-12 rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-mist)] px-4 text-base font-normal text-[var(--stasus-ink)] outline-none focus-visible:border-[var(--stasus-teal-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--stasus-aqua)] dark:bg-[var(--stasus-surface)]"
        />
      </label>

      {state.error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--stasus-teal)] px-6 text-base font-semibold text-white transition-colors hover:bg-[var(--stasus-teal-secondary)] disabled:opacity-60 dark:bg-[var(--stasus-aqua)] dark:text-[#001219]"
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
              className="font-medium text-[var(--stasus-teal)] underline-offset-2 hover:underline dark:text-[var(--stasus-aqua)]"
            >
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[var(--stasus-teal)] underline-offset-2 hover:underline dark:text-[var(--stasus-aqua)]"
            >
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
