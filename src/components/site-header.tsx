"use client";

import Image from "next/image";
import { useTheme } from "@/components/theme-provider";

export function SiteHeader() {
  const { theme, toggleTheme } = useTheme();
  const lockup =
    theme === "dark"
      ? "/brand/logo-lockup-dark.png"
      : "/brand/logo-lockup-light.png";

  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
      <a href="/" className="inline-flex items-center" aria-label="Stasus home">
        <Image
          src={lockup}
          alt="Stasus"
          width={320}
          height={96}
          priority
          className="h-12 w-auto md:h-14"
        />
      </a>
      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-full border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-4 py-2 text-sm font-medium text-[var(--stasus-ink)] transition-colors hover:border-[var(--stasus-teal-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-teal)]"
        aria-label={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
      >
        {theme === "dark" ? "Light" : "Dark"}
      </button>
    </header>
  );
}
