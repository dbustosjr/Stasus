"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AppTabKey } from "@/components/app-tab-bar";

const LINKS: { key: AppTabKey; href: string; label: string }[] = [
  { key: "home", href: "/app", label: "Home" },
  { key: "exercises", href: "/app/exercises", label: "Exercises" },
  { key: "tracker", href: "/app/tracker", label: "Tracker" },
  { key: "calm", href: "/app/calm", label: "Calm" },
  { key: "insights", href: "/app/insights", label: "Insights" },
];

type AppNavProps = {
  active: AppTabKey;
};

export function AppNav({ active }: AppNavProps) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState(active);

  useEffect(() => {
    setOptimistic(active);
  }, [active]);

  useEffect(() => {
    for (const link of LINKS) {
      router.prefetch(link.href);
    }
  }, [router]);

  const linkClass = (key: AppTabKey) =>
    `inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)] active:scale-[0.98] sm:px-4 ${
      optimistic === key
        ? "bg-[var(--stasus-teal)] text-white dark:bg-[var(--stasus-aqua)] dark:text-[#001219]"
        : "text-[var(--stasus-ink-muted)] hover:bg-[var(--stasus-surface)] hover:text-[var(--stasus-ink)]"
    }`;

  return (
    <nav
      className="hidden flex-wrap gap-1 md:flex"
      aria-label="App"
    >
      {LINKS.map((link) => (
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
