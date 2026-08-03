"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type AppTabKey = "home" | "exercises" | "tracker" | "calm" | "insights";

const TABS: {
  key: AppTabKey;
  href: string;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "home",
    href: "/app",
    label: "Home",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-5">
        <path
          d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "exercises",
    href: "/app/exercises",
    label: "Exercises",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-5">
        <path
          d="M7 8v8M17 8v8M4 10h3M17 10h3M4 14h3M17 14h3M10 7v10h4V7h-4Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "tracker",
    href: "/app/tracker",
    label: "Tracker",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-5">
        <path
          d="M4 19V5M4 19h16M8 15l3-4 3 2 4-6"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "calm",
    href: "/app/calm",
    label: "Calm",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-5">
        <path
          d="M12 4c-2.5 3-4 5.5-4 8a4 4 0 0 0 8 0c0-2.5-1.5-5-4-8Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M12 20v-3"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "insights",
    href: "/app/insights",
    label: "Insights",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-5">
        <path
          d="M12 4v4M12 16v4M4 12h4M16 12h4M7 7l2.5 2.5M14.5 14.5 17 17M17 7l-2.5 2.5M9.5 14.5 7 17"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="2.25" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    ),
  },
];

type AppTabBarProps = {
  active: AppTabKey;
};

export function AppTabBar({ active }: AppTabBarProps) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState(active);

  useEffect(() => {
    setOptimistic(active);
  }, [active]);

  useEffect(() => {
    for (const tab of TABS) {
      router.prefetch(tab.href);
    }
  }, [router]);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--stasus-border)] bg-[var(--stasus-bg)] pb-[env(safe-area-inset-bottom)]"
      aria-label="App"
    >
      <ul className="mx-auto flex max-w-5xl items-stretch justify-around gap-0.5 px-1 pt-1">
        {TABS.map((tab) => {
          const isActive = optimistic === tab.key;
          return (
            <li key={tab.key} className="flex min-w-0 flex-1">
              <Link
                href={tab.href}
                prefetch
                aria-current={isActive ? "page" : undefined}
                onPointerDown={() => setOptimistic(tab.key)}
                className={`flex min-h-12 w-full cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium leading-tight transition-colors active:scale-[0.98] sm:text-xs ${
                  isActive
                    ? "bg-[var(--stasus-teal)] text-white dark:bg-[var(--stasus-aqua)] dark:text-[#001219]"
                    : "text-[var(--stasus-ink-muted)] hover:bg-[var(--stasus-surface)] hover:text-[var(--stasus-ink)]"
                }`}
              >
                {tab.icon}
                <span className="truncate">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
