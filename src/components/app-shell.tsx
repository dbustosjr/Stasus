"use client";

import { usePathname } from "next/navigation";
import { AccountMenu } from "@/components/account-menu";
import { AppNav } from "@/components/app-nav";
import { AppTabBar } from "@/components/app-tab-bar";
import { SiteHeader } from "@/components/site-header";
import { TimezoneSync } from "@/components/timezone-sync";
import { appTabFromPathname, isAppChromePath } from "@/lib/nav/app-tab";
import { CATEGORY_META, type ExerciseCategory } from "@/lib/exercises/types";

type AppShellProps = {
  children: React.ReactNode;
  email?: string | null;
  showAdmin?: boolean;
};

/**
 * Persistent dashboard chrome. Active tab is derived from the URL so the shell
 * can live in the /app layout and stay mounted across tab navigations.
 */
export function AppShell({
  children,
  email,
  showAdmin = false,
}: AppShellProps) {
  const pathname = usePathname() || "/app";

  if (!isAppChromePath(pathname)) {
    return <>{children}</>;
  }

  const active = appTabFromPathname(pathname);

  return (
    <div className="relative flex min-h-full flex-col bg-[var(--stasus-bg)] pb-[env(safe-area-inset-bottom)]">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-5xl items-center justify-end gap-3 px-4 pt-1 sm:px-6 md:justify-between">
        <AppNav active={active} />
        <div className="flex min-w-0 items-center gap-3">
          {email ? (
            <span className="hidden truncate text-sm text-[var(--stasus-ink-muted)] md:inline md:max-w-[14rem]">
              {email}
            </span>
          ) : null}
          <AccountMenu email={email} showAdmin={showAdmin} />
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
        <AppTabBar active={active} />
      </div>
      <TimezoneSync />
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
