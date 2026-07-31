import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Overview · Stasus",
  description:
    "What Stasus is and is not: browser-based vestibular wellness with guided practice, symptom tracking, and pattern notes.",
};

const shell = "mx-auto w-full max-w-[75rem] px-6 sm:px-8 md:px-12";

export default function OverviewPage() {
  return (
    <div className="relative flex min-h-full flex-col bg-[var(--stasus-bg)]">
      <main id="main-content" tabIndex={-1} className="outline-none">
        <div className={shell}>
          <SiteHeader className="px-0 sm:px-0 md:px-0" />
        </div>

        <article className={`${shell} max-w-3xl pb-20 pt-6 md:pb-28 md:pt-10`}>
          <p className="text-sm font-semibold tracking-[0.12em] text-[var(--stasus-ink-muted)] uppercase">
            Overview
          </p>
          <h1 className="font-display mt-3 text-4xl font-medium tracking-tight text-[var(--stasus-ink)] sm:text-5xl">
            What Stasus is, plainly.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[var(--stasus-ink-muted)]">
            Stasus is a browser-based vestibular wellness app. You can log what
            flares, practice guided exercises that fit how you feel, use short
            calm tools when the checking loop gets loud, and read gentle
            pattern notes over time.
          </p>

          <section className="mt-12 border-t border-[var(--stasus-border)] pt-10">
            <h2 className="font-display text-2xl font-medium text-[var(--stasus-ink)]">
              Who it is for
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--stasus-ink-muted)]">
              People living with dizziness, imbalance, or the worry that
              follows, whether or not they have a formal diagnosis. It is built
              for everyday use at home, including days when attention and motion
              tolerance are limited.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-2xl font-medium text-[var(--stasus-ink)]">
              What it is not
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--stasus-ink-muted)]">
              Stasus is not a clinic, not a diagnosis engine, and not a
              treatment plan. It does not replace care from a clinician. If
              symptoms feel like an emergency, seek urgent care. The app
              includes emergency cues for sudden severe symptoms with warning
              signs.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-2xl font-medium text-[var(--stasus-ink)]">
              What you can do today
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-[var(--stasus-ink-muted)]">
              <li>Log severity, duration, triggers, and notes; see trends.</li>
              <li>
                Practice from a guided library (gaze, balance, habituation, and
                education about inner-ear crystal shifts, often called BPPV).
              </li>
              <li>
                Optional camera practice on your device for some exercises.
                Video stays on your device; the app keeps only practice
                metadata such as timing and whether tracking looked stable.
              </li>
              <li>Use calm tools when the urge to keep checking shows up.</li>
              <li>
                Read daily, weekly, and monthly notes in plain language. Export
                your logs and practice sessions as CSV or PDF. Delete your
                account when you want your data gone.
              </li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-2xl font-medium text-[var(--stasus-ink)]">
              Why optional camera practice matters
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--stasus-ink-muted)]">
              Some vestibular practices ask you to move your head while keeping
              your eyes on a target. A short on-device check can show whether
              your gaze stayed with that target. Nothing is uploaded as video.
              The camera does not start until you choose to begin.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-2xl font-medium text-[var(--stasus-ink)]">
              What we are learning
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--stasus-ink-muted)]">
              Early use helps us see whether people can log comfortably,
              practice without overwhelm, and find the notes useful. We are not
              claiming clinical outcomes. We measure engagement and whether the
              product stays calm and usable in real life.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-2xl font-medium text-[var(--stasus-ink)]">
              Privacy and contact
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--stasus-ink-muted)]">
              Symptom logs, practice sessions, and notes are tied to your
              account. You can export them or delete your account from the app.
              Camera video is not stored by Stasus. For questions, contact the
              Stasus team through the product channels you already use to reach
              us.
            </p>
          </section>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--stasus-aqua)] px-7 text-base font-semibold text-[#001219] transition-colors hover:bg-[color-mix(in_srgb,var(--stasus-aqua)_88%,white)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)]"
            >
              Begin gently
            </Link>
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--stasus-border)] px-6 text-base font-medium text-[var(--stasus-ink)] transition-colors hover:bg-[var(--stasus-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)]"
            >
              Back to home
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
