import Image from "next/image";
import { SiteHeader } from "@/components/site-header";

/**
 * THESIS: Brand-led calm first screen — Stasus as the hero signal, not a dashboard.
 * OWN-WORLD: PRD teal/aqua/gold tokens, Manrope, soft surfaces, motion-safe.
 * STORY: Visitor understands this is vestibular symptom support (wellness, not diagnosis).
 * FIRST VIEWPORT: lockup in header + large mark, one headline, one line, one CTA.
 * FORM: Persuade landing shell; feature modules come next.
 */
export default function Home() {
  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-[var(--stasus-bg)]">
      {/* Soft atmospheric plane — no autoplay motion, no parallax */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_srgb,var(--stasus-aqua)_28%,transparent),transparent_55%),radial-gradient(ellipse_at_90%_20%,color-mix(in_srgb,var(--stasus-teal-secondary)_12%,transparent),transparent_45%)] dark:bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_srgb,var(--stasus-aqua)_18%,transparent),transparent_50%),radial-gradient(ellipse_at_85%_10%,color-mix(in_srgb,var(--stasus-gold)_8%,transparent),transparent_40%)]"
      />

      <SiteHeader />

      <main className="relative z-10 flex flex-1 flex-col justify-center px-6 pb-16 pt-6 md:px-10 md:pb-24">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-12 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-16">
          <div className="flex flex-col items-start gap-6">
            <p className="text-sm font-medium tracking-wide text-[var(--stasus-ink-muted)]">
              Vestibular wellness
            </p>
            <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-[var(--stasus-ink)] md:text-5xl">
              Steadier days, built around your symptoms.
            </h1>
            <p className="max-w-lg text-lg font-normal leading-relaxed text-[var(--stasus-ink-muted)]">
              Track what flares, practice condition-mapped rehab exercises, and
              calm the hypervigilance loop — without diagnostic claims.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--stasus-teal)] px-6 text-base font-semibold text-white transition-colors hover:bg-[var(--stasus-teal-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)] dark:bg-[var(--stasus-aqua)] dark:text-[#001219] dark:hover:bg-[#9ec9c6]"
              >
                Get started
              </a>
              <span className="text-sm text-[var(--stasus-ink-muted)]">
                Light & dark · motion-safe by design
              </span>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-8 rounded-full bg-[color-mix(in_srgb,var(--stasus-aqua)_20%,transparent)] blur-3xl dark:bg-[color-mix(in_srgb,var(--stasus-aqua)_12%,transparent)]" />
            <Image
              src="/brand/mark-light.png"
              alt=""
              width={480}
              height={508}
              priority
              className="relative h-auto w-72 drop-shadow-sm md:w-96 dark:hidden"
            />
            <Image
              src="/brand/mark-dark.png"
              alt=""
              width={480}
              height={508}
              priority
              className="relative hidden h-auto w-72 drop-shadow-sm md:w-96 dark:block"
            />
          </div>
        </div>

        <section
          id="get-started"
          className="mx-auto mt-20 w-full max-w-5xl rounded-[1.5rem] border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-6 py-8 md:px-10"
        >
          <h2 className="text-xl font-semibold text-[var(--stasus-ink)]">
            Building in the open
          </h2>
          <p className="mt-2 max-w-2xl text-[var(--stasus-ink-muted)]">
            You&apos;re looking at the Stasus shell — brand, theme, and InsForge
            foundation. Exercise library, tracker, and AI assistant land next,
            in that order.
          </p>
        </section>
      </main>
    </div>
  );
}
