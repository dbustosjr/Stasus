"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { AppTabKey } from "@/components/app-tab-bar";

const TAB_DEFS: { key: AppTabKey; path: string; label: string }[] = [
  { key: "home", path: "", label: "Home" },
  { key: "exercises", path: "/exercises", label: "Exercises" },
  { key: "tracker", path: "/tracker", label: "Tracker" },
  { key: "calm", path: "/calm", label: "Calm" },
  { key: "insights", path: "/insights", label: "Insights" },
];

type AppNavProps = {
  active: AppTabKey;
  /** App root: `/app` (live) or `/demo`. */
  basePath?: "/app" | "/demo";
};

export function AppNav({ active, basePath = "/app" }: AppNavProps) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState(active);
  const links = useMemo(
    () =>
      TAB_DEFS.map((t) => ({
        ...t,
        href: t.path ? `${basePath}${t.path}` : basePath,
      })),
    [basePath],
  );

  useEffect(() => {
    setOptimistic(active);
  }, [active]);

  useEffect(() => {
    for (const link of links) {
      router.prefetch(link.href);
    }
  }, [router, links]);

  const linkClass = (key: AppTabKey) =>
    `inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)] active:scale-[0.98] sm:px-4 ${
      optimistic === key
        ? "bg-[var(--stasus-teal)] text-white dark:bg-[var(--stasus-aqua)] dark:text-[#001219]"
        : "text-[var(--stasus-ink-muted)] hover:bg-[var(--stasus-surface)] hover:text-[var(--stasus-ink)]"
    }`;

  return (
    <nav className="hidden flex-wrap gap-1 md:flex" aria-label="App">
      {links.map((link) => (
        <Link
          key={link.key}
          href={link.href}
          prefetch
          className={linkClass(link.key)}
          aria-current={optimistic === link.key ? "page" : undefined}
          onPointerDown={() => setOptimistic(link.key)}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
