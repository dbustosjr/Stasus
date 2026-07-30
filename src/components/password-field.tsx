"use client";

import { useId, useState } from "react";

type PasswordFieldProps = {
  name?: string;
  autoComplete?: string;
  label?: string;
  required?: boolean;
  minLength?: number;
  defaultValue?: string;
};

export function PasswordField({
  name = "password",
  autoComplete = "current-password",
  label = "Password",
  required = true,
  minLength = 8,
  defaultValue,
}: PasswordFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <label
      htmlFor={id}
      className="flex flex-col gap-1.5 text-sm font-medium text-[var(--stasus-ink)]"
    >
      {label}
      <span className="relative block">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          defaultValue={defaultValue}
          className="h-12 w-full rounded-xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] py-0 pr-12 pl-4 text-base font-normal text-[var(--stasus-ink)] outline-none focus-visible:border-[var(--stasus-teal-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--stasus-aqua)]"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute top-1/2 right-2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--stasus-ink-muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_14%,transparent)] hover:text-[var(--stasus-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)]"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </span>
    </label>
  );
}

function EyeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 5.1A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a17.5 17.5 0 0 1-3.1 4.1" />
      <path d="M6.1 6.1A17.4 17.4 0 0 0 2 12s3.5 7 10 7a10.4 10.4 0 0 0 4.2-.9" />
    </svg>
  );
}
