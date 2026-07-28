import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { SiteHeader } from "@/components/site-header";
import { CATEGORY_META, type ExerciseCategory } from "@/lib/exercises/types";

type AppShellProps = {
  children: React.ReactNode;
  email?: string | null;
  active?: "home" | "exercises" | "tracker";
};

export function AppShell({ children, email, active = "home" }: AppShellProps) {
  const linkClass = (key: typeof active) =>
    `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      active === key
        ? "bg-[var(--stasus-teal)] text-white dark:bg-[var(--stasus-aqua)] dark:text-[#001219]"
        : "text-[var(--stasus-ink-muted)] hover:bg-[var(--stasus-surface)] hover:text-[var(--stasus-ink)]"
    }`;

  return (
    <div className="relative flex min-h-full flex-col bg-[var(--stasus-bg)]">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 pt-2">
        <nav className="flex flex-wrap gap-2" aria-label="App">
          <Link href="/app" className={linkClass("home")}>
            Home
          </Link>
          <Link href="/app/exercises" className={linkClass("exercises")}>
            Exercises
          </Link>
          <Link href="/app/tracker" className={linkClass("tracker")}>
            Tracker
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {email ? (
            <span className="hidden text-sm text-[var(--stasus-ink-muted)] sm:inline">
              {email}
            </span>
          ) : null}
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-4 py-2 text-sm font-medium text-[var(--stasus-ink)]"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-10">
        {children}
      </main>
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
