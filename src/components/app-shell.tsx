import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { SiteHeader } from "@/components/site-header";
import { TimezoneSync } from "@/components/timezone-sync";
import { CATEGORY_META, type ExerciseCategory } from "@/lib/exercises/types";

type AppShellProps = {
  children: React.ReactNode;
  email?: string | null;
  active?: "home" | "exercises" | "tracker" | "calm" | "insights";
};

export function AppShell({ children, email, active = "home" }: AppShellProps) {
  const linkClass = (key: typeof active) =>
    `inline-flex min-h-11 shrink-0 items-center rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)] sm:px-4 ${
      active === key
        ? "bg-[var(--stasus-teal)] text-white dark:bg-[var(--stasus-aqua)] dark:text-[#001219]"
        : "text-[var(--stasus-ink-muted)] hover:bg-[var(--stasus-surface)] hover:text-[var(--stasus-ink)]"
    }`;

  return (
    <div className="relative flex min-h-full flex-col bg-[var(--stasus-bg)] pb-[env(safe-area-inset-bottom)]">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 pt-1 sm:px-6 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-3">
        <nav
          className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
          aria-label="App"
        >
          <Link
            href="/app"
            className={linkClass("home")}
            aria-current={active === "home" ? "page" : undefined}
          >
            Home
          </Link>
          <Link
            href="/app/exercises"
            className={linkClass("exercises")}
            aria-current={active === "exercises" ? "page" : undefined}
          >
            Exercises
          </Link>
          <Link
            href="/app/tracker"
            className={linkClass("tracker")}
            aria-current={active === "tracker" ? "page" : undefined}
          >
            Tracker
          </Link>
          <Link
            href="/app/calm"
            className={linkClass("calm")}
            aria-current={active === "calm" ? "page" : undefined}
          >
            Calm
          </Link>
          <Link
            href="/app/insights"
            className={linkClass("insights")}
            aria-current={active === "insights" ? "page" : undefined}
          >
            Insights
          </Link>
        </nav>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          {email ? (
            <span className="truncate text-sm text-[var(--stasus-ink-muted)] sm:max-w-[14rem]">
              {email}
            </span>
          ) : null}
          <form action={signOut}>
            <button
              type="submit"
              className="min-h-11 cursor-pointer rounded-full border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-4 py-2 text-sm font-medium text-[var(--stasus-ink)] transition-colors hover:border-[var(--stasus-teal-secondary)] hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_18%,var(--stasus-surface))] hover:text-[var(--stasus-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-teal)] active:scale-[0.98]"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 py-6 outline-none sm:gap-6 sm:px-6 sm:py-8 md:py-10"
      >
        {children}
      </main>
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
