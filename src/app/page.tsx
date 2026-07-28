import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

/**
 * Persuade landing — editorial calm, brand-first, motion-safe.
 * Inspired by confident health-tech storytelling; original Stasus voice & tokens.
 */
export default function Home() {
  return (
    <div className="relative flex min-h-full flex-col bg-[var(--stasus-bg)]">
      {/* Full-bleed first viewport */}
      <section className="relative isolate min-h-[min(92vh,52rem)] overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(165deg,#001219_0%,#012833_48%,#014152_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 bottom-0 h-[70%] w-[55%] bg-[color-mix(in_srgb,var(--stasus-aqua)_22%,transparent)] opacity-40 [clip-path:polygon(28%_0,100%_0,100%_100%,0_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]"
        />

        <SiteHeader />

        <div className="relative z-10 mx-auto flex min-h-[min(78vh,44rem)] w-full max-w-6xl flex-col justify-center gap-10 px-4 pb-14 pt-6 sm:px-6 sm:pb-20 md:flex-row md:items-end md:justify-between md:px-10 md:pb-24 md:pt-4">
          <div className="max-w-xl animate-[stasus-rise_0.7s_ease-out_both]">
            <p className="text-sm font-medium tracking-[0.14em] text-[color-mix(in_srgb,white_72%,transparent)] uppercase">
              Vestibular wellness
            </p>
            <h1 className="font-display mt-4 text-5xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
              Steadier days.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[color-mix(in_srgb,white_78%,transparent)] sm:text-lg">
              A quiet place to notice what flares, practice mapped rehab, and
              ease the checking loop — without turning your body into a
              diagnosis.
            </p>
            <div className="mt-8 flex w-full flex-col gap-5 sm:w-fit">
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/signup"
                  className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-white px-7 text-base font-semibold text-[#014152] transition-colors hover:bg-[color-mix(in_srgb,white_90%,var(--stasus-aqua))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
                >
                  Begin gently
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full border border-[color-mix(in_srgb,white_45%,transparent)] px-6 text-base font-medium text-white transition-colors hover:border-white hover:bg-[color-mix(in_srgb,white_10%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
                >
                  Sign in
                </Link>
              </div>
              <p className="text-center text-sm text-[color-mix(in_srgb,white_55%,transparent)]">
                Motion-safe by design · works in the browser and on your home
                screen
              </p>
            </div>
          </div>

          <div className="flex justify-center md:justify-end md:pb-4">
            <div className="relative animate-[stasus-rise_0.85s_ease-out_0.08s_both]">
              <div
                aria-hidden
                className="absolute inset-6 rounded-full bg-[color-mix(in_srgb,var(--stasus-aqua)_35%,transparent)] blur-3xl"
              />
              <Image
                src="/brand/mark-dark.png"
                alt=""
                width={480}
                height={508}
                priority
                className="relative h-auto w-40 drop-shadow-lg sm:w-56 md:w-80 lg:w-[22rem]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Story band */}
      <section className="border-b border-[var(--stasus-border)] bg-[var(--stasus-bg)] px-4 py-16 sm:px-6 md:px-10 md:py-24">
        <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-16 md:items-start">
          <h2 className="font-display text-3xl font-medium leading-tight tracking-tight text-[var(--stasus-ink)] sm:text-4xl md:text-[2.75rem]">
            Every unsteady day still belongs to you.
          </h2>
          <p className="max-w-lg text-base leading-relaxed text-[var(--stasus-ink-muted)] sm:text-lg">
            Stasus is for people living with dizziness, imbalance, and the
            worry that follows — diagnosed or not. You log what you notice,
            practice what fits, and get a weekly look at patterns. No scores to
            chase. No lecture after every entry.
          </p>
        </div>
      </section>

      {/* Editorial list — not card grid */}
      <section className="bg-[var(--stasus-bg)] px-4 py-16 sm:px-6 md:px-10 md:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-sm font-semibold tracking-[0.12em] text-[var(--stasus-ink-muted)] uppercase">
            What you can do here
          </p>
          <ul className="mt-8 divide-y divide-[var(--stasus-border)] border-y border-[var(--stasus-border)]">
            {[
              {
                title: "Notice what flares",
                body: "Severity, duration, and the triggers that keep showing up — weather, screens, sleep, stress, or your own note.",
              },
              {
                title: "Practice with a map, not a guess",
                body: "Habituation, gaze, balance, and canalith orientation — guided for comfort, with optional camera checks when they help.",
              },
              {
                title: "Calm the checking loop",
                body: "Short tools for the fear–avoidance spiral, so attention can soften without pretending symptoms aren’t real.",
              },
              {
                title: "A weekly letter to yourself",
                body: "Pattern-level insights once a week — plain language, no diagnosis, nothing reactive after every log.",
              },
            ].map((item) => (
              <li
                key={item.title}
                className="grid gap-3 py-8 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:gap-10"
              >
                <h3 className="font-display text-2xl font-medium text-[var(--stasus-ink)]">
                  {item.title}
                </h3>
                <p className="text-base leading-relaxed text-[var(--stasus-ink-muted)]">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing CTA band */}
      <section className="relative overflow-hidden bg-[#012833] px-4 py-16 text-white sm:px-6 md:px-10 md:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[color-mix(in_srgb,var(--stasus-aqua)_18%,transparent)] [clip-path:polygon(40%_0,100%_0,100%_100%,0_100%)]"
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              Ready when you are.
            </h2>
            <p className="mt-3 text-base text-[color-mix(in_srgb,white_78%,transparent)]">
              Start with what you’re feeling. You can share a condition label
              later — or never.
            </p>
          </div>
          <Link
            href="/signup"
            className="inline-flex h-12 w-fit cursor-pointer items-center justify-center rounded-full bg-white px-7 text-base font-semibold text-[#014152] transition-colors hover:bg-[color-mix(in_srgb,white_90%,var(--stasus-aqua))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Create your space
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--stasus-border)] bg-[var(--stasus-bg)] px-4 py-10 sm:px-6 md:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-lg text-[var(--stasus-ink)]">
            Stasus
          </p>
          <p className="max-w-md text-sm leading-relaxed text-[var(--stasus-ink-muted)]">
            Wellness support for vestibular symptoms — not a clinic, not a
            diagnosis engine. Built to stay calm on purpose.
          </p>
        </div>
      </footer>
    </div>
  );
}
