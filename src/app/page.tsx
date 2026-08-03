import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { WebcamDemo } from "@/components/webcam-demo";
import { LandingSeverityDemo } from "@/components/landing-severity-demo";

/** Shared landing content measure — logo, hero, and body share this grid. */
const shell =
  "mx-auto w-full max-w-[75rem] px-6 sm:px-8 md:px-12";

const PRODUCT_SHOTS = [
  {
    src: "/landing/product-tracker-v3.png",
    alt: "Stasus symptom tracker with recent severity trend on desktop",
    caption: "Symptom tracker",
    detail: "Log severity, duration, and what may have stirred it.",
  },
  {
    src: "/landing/product-exercises-v3.png",
    alt: "Stasus exercise library habituation grid on desktop",
    caption: "Exercise map",
    detail: "Guided practices for gaze, balance, and gentle motion.",
  },
  {
    src: "/landing/product-notes-v3.png",
    alt: "Stasus daily notes written in plain language",
    caption: "Daily notes",
    detail: "A calm look at what you logged, in plain language.",
  },
] as const;

/**
 * Persuade landing — editorial calm, brand-first, motion-safe.
 * Inspired by confident health-tech storytelling; original Stasus voice & tokens.
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const params = await searchParams;
  const justDeleted = params.deleted === "1";

  return (
    <div className="relative flex min-h-full flex-col bg-[var(--stasus-bg)]">
      {justDeleted ? (
        <p
          role="status"
          className="border-b border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-4 py-3 text-center text-sm text-[var(--stasus-ink-muted)]"
        >
          Your account and data were deleted. You’re welcome back anytime.
        </p>
      ) : null}
      <main id="main-content" tabIndex={-1} className="outline-none">
        {/* Hero — shared container, compact demo preview on desktop */}
        <section
          className="relative isolate overflow-hidden"
          aria-labelledby="landing-hero-heading"
        >
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

          <div className={`relative z-10 ${shell}`}>
            <SiteHeader className="px-0 sm:px-0 md:px-0" />

            <div className="grid items-center gap-10 pb-16 pt-6 md:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] md:gap-16 md:pb-20 md:pt-8 lg:gap-20">
              <div className="animate-[stasus-rise_0.7s_ease-out_both]">
                <p className="text-sm font-medium tracking-[0.14em] text-[color-mix(in_srgb,white_80%,transparent)] uppercase">
                  Vestibular wellness
                </p>
                <h1
                  id="landing-hero-heading"
                  className="font-display mt-4 text-5xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl md:text-[4.25rem]"
                >
                  Steadier days.
                </h1>
                <p className="mt-5 max-w-lg text-base leading-relaxed text-[color-mix(in_srgb,white_88%,transparent)] sm:text-lg">
                  Browser-based vestibular wellness with guided exercises,
                  symptom tracking, and weekly pattern insights.
                </p>
                <p className="mt-3 max-w-md text-base leading-relaxed text-[color-mix(in_srgb,white_78%,transparent)]">
                  A quiet place to notice what flares, practice what fits, and
                  ease the checking loop, without turning your body into a
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
                      className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full border border-[color-mix(in_srgb,white_55%,transparent)] px-6 text-base font-medium text-white transition-colors hover:border-white hover:bg-[color-mix(in_srgb,white_10%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
                    >
                      Sign in
                    </Link>
                  </div>
                  <p className="text-center text-sm text-[color-mix(in_srgb,white_75%,transparent)] sm:text-left">
                    Motion-safe by design · works in the browser and on your home
                    screen
                  </p>
                </div>
              </div>

              <div className="animate-[stasus-rise_0.7s_ease-out_0.12s_both] md:max-w-xl md:justify-self-end lg:max-w-[38rem]">
                <WebcamDemo
                  variant="hero"
                  src="/demo/symptom-tracker.mp4"
                  poster="/demo/symptom-tracker-poster.png"
                  ariaLabel="Demo of the Stasus symptom tracker"
                  playLabel="See the symptom tracker"
                  caption="Log flares and see your trend · tap play when you’re ready"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Transition band — same grid as body */}
        <section className="border-b border-[var(--stasus-border)] bg-[var(--stasus-bg)] py-16 md:py-20">
          <div
            className={`${shell} grid gap-8 md:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] md:items-start md:gap-20`}
          >
            <h2 className="font-display text-3xl font-medium leading-tight tracking-tight text-[var(--stasus-ink)] sm:text-4xl md:text-[2.5rem]">
              Every unsteady day still belongs to you.
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-[var(--stasus-ink-muted)] sm:text-lg md:pt-1">
              Stasus is for people living with dizziness, imbalance, and the
              worry that follows, whether or not you have a diagnosis. You log
              what you notice, practice what fits, and get a weekly look at
              patterns. No scores to chase. No lecture after every entry.
            </p>
          </div>
        </section>

        {/* Full demo — filled 16:9, no oversized side gutters */}
        <section
          id="practice-demo"
          className="border-b border-[var(--stasus-border)] bg-[var(--stasus-bg)] py-16 md:py-24"
        >
          <div className={`${shell} flex flex-col gap-10`}>
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-medium leading-tight tracking-tight text-[var(--stasus-ink)] sm:text-4xl">
                See how a calm head-movement check looks in Stasus.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--stasus-ink-muted)] sm:text-lg">
                Optional camera support for practice. On your device only;
                nothing is recorded as video. Tap play when you’re ready.
                Nothing starts on its own.
              </p>
            </div>
            <div className="mx-auto w-full max-w-[65rem]">
              <WebcamDemo variant="full" />
            </div>
          </div>
        </section>

        {/* Product screenshots */}
        <section className="border-b border-[var(--stasus-border)] bg-[var(--stasus-bg)] py-16 md:py-20">
          <div className={shell}>
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-medium leading-tight tracking-tight text-[var(--stasus-ink)] sm:text-4xl">
                Inside the product
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[var(--stasus-ink-muted)] sm:text-lg">
                Tracking, practice, and a weekly letter, in the same calm space.
              </p>
            </div>
            <ul className="mt-10 grid gap-8 md:grid-cols-3 md:items-start md:gap-6">
              {PRODUCT_SHOTS.map((shot) => (
                <li key={shot.src} className="flex flex-col gap-3">
                  {/* Mobile: natural height. md+: equal ~3:2 frames matching the desktop shots. */}
                  <div className="overflow-hidden rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] shadow-[0_20px_60px_-40px_rgba(0,0,0,0.65)] md:aspect-[3/2]">
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      width={1024}
                      height={689}
                      className="h-auto w-full md:h-full md:w-full md:object-cover md:object-top"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div>
                    <p className="text-base font-medium text-[var(--stasus-ink)]">
                      {shot.caption}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--stasus-ink-muted)]">
                      {shot.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Features — meaning-grouped columns */}
        <section className="bg-[var(--stasus-bg)] py-16 md:py-20">
          <div className={shell}>
            <header className="max-w-2xl border-b border-[var(--stasus-border)] pb-10">
              <p className="text-sm font-semibold tracking-[0.12em] text-[var(--stasus-ink-muted)] uppercase">
                What you can do here
              </p>
              <h2 className="font-display mt-3 text-3xl font-medium leading-tight tracking-tight text-[var(--stasus-ink)] sm:text-4xl">
                Practice with a map, not a guess
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[var(--stasus-ink-muted)] sm:text-lg">
                Short practices for gaze, balance, getting used to motion a
                little at a time, and clear education about inner-ear crystal
                shifts (often called BPPV). Optional camera checks are available
                for some of them. See the demo above for how a calm check looks.
              </p>
              <p className="mt-3 text-base leading-relaxed text-[var(--stasus-ink-muted)] sm:text-lg">
                Go at your own pace. Stop if symptoms spike, you feel unsafe, or
                anything feels wrong. Stasus does not supervise practice and does
                not promise that a session will feel comfortable.
              </p>
            </header>

            <ul className="mt-2 divide-y divide-[var(--stasus-border)]">
              <li className="grid gap-5 py-9 md:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] md:gap-16 md:py-10">
                <div>
                  <h3 className="font-display text-2xl font-medium text-[var(--stasus-ink)]">
                    Notice what flares
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-[var(--stasus-ink-muted)]">
                    Severity, duration, and the triggers that keep showing up:
                    weather, screens, sleep, stress, or your own note. Trends are
                    interactive. Inspect a day, change the window, and jump back
                    to the log.
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--stasus-border)] bg-[color-mix(in_srgb,var(--stasus-surface)_88%,transparent)] px-4 py-4 sm:px-5">
                  <LandingSeverityDemo />
                </div>
              </li>

              <li className="grid gap-5 py-9 md:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] md:gap-16 md:py-10">
                <div>
                  <h3 className="font-display text-2xl font-medium text-[var(--stasus-ink)]">
                    Calm the checking loop
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-[var(--stasus-ink-muted)]">
                    Short tools when fear and checking start to spiral, so
                    attention can soften without pretending symptoms aren’t
                    real.
                  </p>
                </div>
                <div
                  className="rounded-2xl border border-[var(--stasus-border)] bg-[color-mix(in_srgb,var(--stasus-surface)_88%,transparent)] px-5 py-5"
                  aria-label="Example calm prompts"
                >
                  <p className="text-xs font-medium tracking-wide text-[var(--stasus-ink-muted)] uppercase">
                    Example · quiet prompts
                  </p>
                  <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-[var(--stasus-ink)]">
                    <li>Name the urge to check, without acting on it yet.</li>
                    <li>Soften the jaw and unclench the hands.</li>
                    <li>Choose one planned next step, not another scan.</li>
                  </ul>
                </div>
              </li>

              <li className="grid gap-5 py-9 md:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] md:gap-16 md:py-10">
                <div>
                  <h3 className="font-display text-2xl font-medium text-[var(--stasus-ink)]">
                    A weekly letter to yourself
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-[var(--stasus-ink-muted)]">
                    Pattern-level notes once a week in plain language. No
                    diagnosis, and nothing reactive after every log. Daily and
                    monthly notes are there too when they help.
                  </p>
                </div>
                <blockquote className="rounded-2xl border border-[var(--stasus-border)] bg-[color-mix(in_srgb,var(--stasus-surface)_88%,transparent)] px-5 py-5">
                  <p className="text-xs font-medium tracking-wide text-[var(--stasus-ink-muted)] uppercase">
                    Example
                  </p>
                  <p className="mt-2 font-display text-base leading-relaxed text-[var(--stasus-ink)]">
                    A few tougher evenings mid-week, with sleep showing up often.
                    Nothing here is a grade. Just a gentle look at what clustered,
                    and room to rest when things spiked.
                  </p>
                </blockquote>
              </li>
            </ul>
          </div>
        </section>

        {/* Closing CTA band */}
        <section className="relative overflow-hidden bg-[#012833] py-16 text-white md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[color-mix(in_srgb,var(--stasus-aqua)_18%,transparent)] [clip-path:polygon(40%_0,100%_0,100%_100%,0_100%)]"
          />
          <div
            className={`relative ${shell} flex flex-col gap-6 md:flex-row md:items-end md:justify-between`}
          >
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
                Ready when you are.
              </h2>
              <p className="mt-3 text-base text-[color-mix(in_srgb,white_88%,transparent)]">
                Start with what you’re feeling. You can share a condition label
                later, or never. Creating an account is free.
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

        {/* Trust & safety */}
        <section className="border-b border-[var(--stasus-border)] bg-[var(--stasus-bg)] py-14 md:py-16">
          <div className={`${shell} max-w-3xl`}>
            <h2 className="font-display text-2xl font-medium text-[var(--stasus-ink)]">
              Trust and safety
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[var(--stasus-ink-muted)] sm:text-base">
              <li>
                Stasus is a general wellness product. It is not medical advice,
                a diagnosis, a treatment plan, or a substitute for care from a
                clinician.
              </li>
              <li>
                Guided practices and calm tools are self-paced. They are not
                supervised care. Stop if symptoms spike, you feel unsafe, or
                anything feels wrong.
              </li>
              <li>
                If symptoms suddenly worsen with warning signs (such as sudden
                severe vertigo with face droop, arm weakness, speech trouble, or
                a sudden severe headache), seek emergency care. The app can show
                emergency cues when those signals are marked; it cannot evaluate
                an emergency for you.
              </li>
              <li>
                Optional camera practice stays on your device. Stasus does not
                store video. You can practice with a simple camera mirror and
                timer, or — only for some exercises — opt in to limited on-device
                practice feedback. That feedback is not a form grade, not medical
                clearance, and not a claim that you are doing an exercise
                correctly or safely. Session metadata such as timing or optional
                counts may be saved with your account. See our{" "}
                <Link
                  href="/privacy/health-data"
                  className="font-medium text-[var(--stasus-ink)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)]"
                >
                  Consumer Health Data Privacy Policy
                </Link>
                . Terms of use will be published before broader invites.
              </li>
              <li>
                Your logs and notes are tied to your account. You can export them
                or delete your account from the app. Contact the Stasus team if
                you need help.
              </li>
            </ul>
          </div>
        </section>

        <footer className="bg-[var(--stasus-bg)] py-10">
          <div className={`${shell} flex flex-wrap items-center gap-x-5 gap-y-2`}>
            <p className="font-display text-lg text-[var(--stasus-ink)]">
              Stasus
            </p>
            <Link
              href="/overview"
              className="text-sm font-medium text-[var(--stasus-ink-muted)] underline-offset-4 transition-colors hover:text-[var(--stasus-ink)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)]"
            >
              Overview
            </Link>
            <Link
              href="/privacy/health-data"
              className="text-sm font-medium text-[var(--stasus-ink-muted)] underline-offset-4 transition-colors hover:text-[var(--stasus-ink)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)]"
            >
              Health data privacy
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
