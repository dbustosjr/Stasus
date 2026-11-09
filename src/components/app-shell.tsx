"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/components/account-menu";
import { AppNav } from "@/components/app-nav";
import { AppTabBar } from "@/components/app-tab-bar";
import { SiteHeader } from "@/components/site-header";
import { TimezoneSync } from "@/components/timezone-sync";
import {
  appBasePathFromPathname,
  appTabFromPathname,
  isAppChromePath,
} from "@/lib/nav/app-tab";
import { CATEGORY_META, type ExerciseCategory } from "@/lib/exercises/types";

type AppShellProps = {
  children: React.ReactNode;
  email?: string | null;
  showAdmin?: boolean;
  /** Force demo chrome; otherwise inferred from pathname. */
  demo?: boolean;
  basePath?: "/app" | "/demo";
};

/**
 * Persistent dashboard chrome. Active tab is derived from the URL so the shell
 * can live in the /app or /demo layout and stay mounted across tab navigations.
 */
export function AppShell({
  children,
  email,
  showAdmin = false,
  demo: demoProp,
  basePath: basePathProp,
}: AppShellProps) {
  const pathname = usePathname() || "/app";

  if (!isAppChromePath(pathname)) {
    return <>{children}</>;
  }

  const basePath = basePathProp ?? appBasePathFromPathname(pathname);
  const demo = demoProp ?? basePath === "/demo";
  const active = appTabFromPathname(pathname);

  return (
    <div className="relative flex min-h-full flex-col bg-[var(--stasus-bg)] pb-[env(safe-area-inset-bottom)]">
      <SiteHeader />
      {demo ? (
        <div className="border-b border-[var(--stasus-border)] bg-[var(--stasus-surface)]">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
            <p className="text-xs font-medium tracking-wide text-[var(--stasus-ink-muted)] uppercase">
              <span className="rounded-full bg-[color-mix(in_srgb,var(--stasus-aqua)_22%,transparent)] px-2.5 py-1 text-[var(--stasus-ink)]">
                Demo
              </span>
              <span className="ml-2 normal-case tracking-normal">
                Sample session — nothing is saved to an account
              </span>
            </p>
            <Link
              href="/"
              className="text-sm font-semibold text-[var(--stasus-teal)] transition-colors hover:text-[var(--stasus-teal-secondary)] dark:text-[var(--stasus-aqua)]"
            >
              Exit demo
            </Link>
          </div>
        </div>
      ) : null}
      <div className="mx-auto flex w-full max-w-5xl items-center justify-end gap-3 px-4 pt-1 sm:px-6 md:justify-between">
        <AppNav active={active} basePath={basePath} />
        <div className="flex min-w-0 items-center gap-3">
          {email ? (
            <span className="hidden truncate text-sm text-[var(--stasus-ink-muted)] md:inline md:max-w-[14rem]">
              {email}
            </span>
          ) : null}
          <AccountMenu
            email={email}
            showAdmin={demo ? false : showAdmin}
            demo={demo}
          />
        </div>
      </div>
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 py-6 pb-24 outline-none sm:gap-6 sm:px-6 sm:py-8 md:pb-0 md:py-10"
      >
        {children}
      </main>
      <div className="md:hidden">
        <AppTabBar active={active} basePath={basePath} />
      </div>
      {demo ? null : <TimezoneSync />}
    </div>
  );
}

export function CategoryBadge({
  category,
}: {
  category: ExerciseCategory;
}) {
  const meta = CATEGORY_META[category];
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        meta.isManeuver
          ? "border border-[var(--stasus-teal-secondary)] bg-[var(--stasus-surface)] text-[var(--stasus-ink)]"
          : "bg-[color-mix(in_srgb,var(--stasus-aqua)_28%,transparent)] text-[var(--stasus-ink)]"
      }`}
    >
      {meta.label}
    </span>
  );
}
