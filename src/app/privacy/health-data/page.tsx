import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Consumer Health Data Privacy Policy · Stasus",
  description:
    "How Stasus collects, uses, shares, and protects Consumer Health Data under a privacy-by-design standard.",
};

const shell = "mx-auto w-full max-w-[75rem] px-6 sm:px-8 md:px-12";

const proseMuted =
  "mt-3 text-base leading-relaxed text-[var(--stasus-ink-muted)]";
const sectionTitle =
  "font-display text-2xl font-medium text-[var(--stasus-ink)]";
const listClass =
  "mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-[var(--stasus-ink-muted)]";

export default function ConsumerHealthDataPrivacyPage() {
  return (
    <div className="relative flex min-h-full flex-col bg-[var(--stasus-bg)]">
      <main id="main-content" tabIndex={-1} className="outline-none">
        <div className={shell}>
          <SiteHeader className="px-0 sm:px-0 md:px-0" />
        </div>

        <article className={`${shell} max-w-3xl pb-20 pt-6 md:pb-28 md:pt-10`}>
          <p className="text-sm font-semibold tracking-[0.12em] text-[var(--stasus-ink-muted)] uppercase">
            Privacy
          </p>
          <h1 className="font-display mt-3 text-4xl font-medium tracking-tight text-[var(--stasus-ink)] sm:text-5xl">
            Consumer Health Data Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-[var(--stasus-ink-muted)]">
            Effective date: August 1, 2026 · Last updated: August 1, 2026
          </p>

          <p className={proseMuted}>
            This Consumer Health Data Privacy Policy (“Policy”) describes how
            Stasus (“we,” “us,” or “Stasus”) collects, uses, shares, and
            protects Consumer Health Data. It sits alongside any general
            privacy notice we publish for account and product use. Where the
            two differ as to Consumer Health Data, this Policy controls.
          </p>
          <p className={proseMuted}>
            This Policy is written to meet the requirements of Washington
            State’s My Health My Data Act (RCW 19.373) and applies to all
            Stasus users, regardless of location, as part of our commitment to
            a consistent privacy-by-design standard for the health data we
            handle.
          </p>

          <section className="mt-12 border-t border-[var(--stasus-border)] pt-10">
            <h2 className={sectionTitle}>1. What counts as Consumer Health Data</h2>
            <p className={proseMuted}>
              “Consumer Health Data” means data that identifies your physical
              or mental health status, or that is used, or reasonably capable of
              being used, to assess, measure, improve, or learn about your
              physical or mental health. For Stasus, this includes:
            </p>
            <ul className={listClass}>
              <li>
                Symptom logs: severity, duration, and free-text notes you enter
              </li>
              <li>
                Trigger data: preset and custom triggers you record
              </li>
              <li>
                Condition labels: any diagnosis or condition pattern you choose
                to share (always optional)
              </li>
              <li>
                Exercise and practice session data: which practice you did, rep
                counts or timing, duration, and scores or stability signals from
                a session
              </li>
              <li>
                Biometric tracking data derived from webcam use: pose and
                gaze-tracking measurements generated on your device during
                exercises (raw video is never captured or stored; see Section 4)
              </li>
              <li>
                Any inferences we or our AI notes draw from the categories above,
                including daily, weekly, and monthly pattern notes
              </li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className={sectionTitle}>
              2. Categories of Consumer Health Data we collect
            </h2>
            <dl className="mt-5 space-y-6">
              <div>
                <dt className="text-base font-medium text-[var(--stasus-ink)]">
                  Symptom and trigger data
                </dt>
                <dd className="mt-1 text-base leading-relaxed text-[var(--stasus-ink-muted)]">
                  Severity, duration, trigger tags, free-text notes. Entered
                  directly by you.
                </dd>
              </div>
              <div>
                <dt className="text-base font-medium text-[var(--stasus-ink)]">
                  Condition information
                </dt>
                <dd className="mt-1 text-base leading-relaxed text-[var(--stasus-ink-muted)]">
                  Self-reported diagnosis or condition pattern labels
                  (optional). Entered by you only if you choose.
                </dd>
              </div>
              <div>
                <dt className="text-base font-medium text-[var(--stasus-ink)]">
                  Exercise and practice activity
                </dt>
                <dd className="mt-1 text-base leading-relaxed text-[var(--stasus-ink-muted)]">
                  Session completions, timing, duration, difficulty progress,
                  and related practice metadata. Generated by your use of the
                  app.
                </dd>
              </div>
              <div>
                <dt className="text-base font-medium text-[var(--stasus-ink)]">
                  On-device biometric measurements
                </dt>
                <dd className="mt-1 text-base leading-relaxed text-[var(--stasus-ink-muted)]">
                  Pose landmarks, gaze or iris tracking points, and
                  tracking-confidence signals. Generated on your device via your
                  webcam during optional camera practice.
                </dd>
              </div>
              <div>
                <dt className="text-base font-medium text-[var(--stasus-ink)]">
                  AI-derived insights
                </dt>
                <dd className="mt-1 text-base leading-relaxed text-[var(--stasus-ink-muted)]">
                  Daily, weekly, and monthly pattern notes generated from the
                  data above by our AI assistant (Claude, via Anthropic’s API).
                </dd>
              </div>
            </dl>
          </section>

          <section className="mt-10">
            <h2 className={sectionTitle}>3. Why we collect it</h2>
            <ul className={listClass}>
              <li>
                To provide the core Stasus service: condition-mapped exercise
                guidance, progress tracking, calm tools, and your personal
                history over time
              </li>
              <li>
                To support optional on-device biometric tracking during
                gaze-stabilization and related practices, so you can see whether
                tracking looked stable
              </li>
              <li>
                To surface daily, weekly, and monthly pattern notes (for
                example, possible clusters between triggers and symptom
                severity)
              </li>
              <li>
                To operate the red-flag safety check, which screens symptom
                entries for patterns that warrant urgent medical attention
              </li>
              <li>
                To let you export your logs and practice sessions, and to
                maintain and improve the app’s safety, security, and reliability
              </li>
            </ul>
            <p className={proseMuted}>
              We do not use Consumer Health Data for advertising, and we do not
              sell Consumer Health Data. Stasus provides general wellness
              information only and does not diagnose, treat, cure, mitigate, or
              prevent any disease or condition.
            </p>
          </section>

          <section className="mt-10">
            <h2 className={sectionTitle}>4. How biometric data is handled</h2>
            <p className={proseMuted}>
              Webcam-based exercise tracking runs on your device using on-device
              processing. Your camera feed itself is never transmitted to or
              stored on Stasus servers. Only derived metadata, such as rep
              counts, session timing, scores, and average tracking confidence,
              is sent to our servers and stored, encrypted at rest. If you do
              not consent to webcam-based tracking, you can use the
              manual, non-tracked version of applicable exercises.
            </p>
          </section>

          <section className="mt-10">
            <h2 className={sectionTitle}>
              5. Categories of third parties we share Consumer Health Data with
            </h2>
            <dl className="mt-5 space-y-6">
              <div>
                <dt className="text-base font-medium text-[var(--stasus-ink)]">
                  Anthropic (Claude API)
                </dt>
                <dd className="mt-1 text-base leading-relaxed text-[var(--stasus-ink-muted)]">
                  Minimum data needed per request: relevant symptom, trigger,
                  and exercise history for the specific note being generated.
                  Purpose: daily, weekly, and monthly AI pattern notes.
                </dd>
              </div>
              <div>
                <dt className="text-base font-medium text-[var(--stasus-ink)]">
                  InsForge (backend infrastructure provider)
                </dt>
                <dd className="mt-1 text-base leading-relaxed text-[var(--stasus-ink-muted)]">
                  Consumer Health Data described in Section 2, as our database,
                  authentication, and hosting provider. Purpose: secure storage,
                  authentication, and operation of the app.
                </dd>
              </div>
            </dl>
            <p className={proseMuted}>
              We do not share Consumer Health Data with data brokers,
              advertisers, or any party for marketing purposes. We do not sell
              Consumer Health Data. Data sent to third-party processors is
              encrypted in transit, and those processors are contractually
              restricted from using your data for any purpose other than
              providing services to Stasus.
            </p>
          </section>

          <section className="mt-10">
            <h2 className={sectionTitle}>6. Your rights</h2>
            <p className={proseMuted}>You have the right to:</p>
            <ul className={listClass}>
              <li>Confirm whether we are processing your Consumer Health Data</li>
              <li>Access your Consumer Health Data</li>
              <li>
                Withdraw consent for collection or sharing of your Consumer
                Health Data at any time
              </li>
              <li>Request deletion of your Consumer Health Data</li>
              <li>Appeal a denial of any of the above requests</li>
            </ul>
            <p className={proseMuted}>
              You can exercise many of these rights from within the app: export
              your data as CSV or PDF, choose whether to use camera practice, and
              delete your account. For other requests, including confirmation,
              access help, or an appeal, contact the Stasus team. We will
              respond within 45 days, consistent with applicable law. We will
              not require you to create a new account to submit a request,
              though we may ask you to verify your identity through your
              existing account.
            </p>
          </section>

          <section className="mt-10">
            <h2 className={sectionTitle}>7. Consent</h2>
            <p className={proseMuted}>
              We obtain your affirmative, opt-in consent before collecting
              Consumer Health Data beyond what is strictly necessary to provide
              the service you requested, and before sharing it with any third
              party for a purpose not disclosed in this Policy. Optional camera
              practice asks for consent before the webcam starts. You may
              withdraw consent at any time through the app (for example, by
              stopping camera practice or deleting your account). If we intend
              to collect or use a new category of Consumer Health Data, or use
              existing data for a new purpose, we will notify you and obtain
              your consent before doing so.
            </p>
          </section>

          <section className="mt-10">
            <h2 className={sectionTitle}>8. Data security</h2>
            <p className={proseMuted}>
              We restrict access to Consumer Health Data to personnel,
              processors, and contractors who need it to operate the service.
              Data is encrypted in transit and at rest. Access to user-owned
              data is enforced at the database level (row-level security),
              independent of application-level controls, so that a single bug
              elsewhere cannot expose another user’s data.
            </p>
          </section>

          <section className="mt-10">
            <h2 className={sectionTitle}>9. Retention</h2>
            <p className={proseMuted}>
              We retain Consumer Health Data for as long as your account remains
              active, or as needed to provide the service. If you delete your
              account, we delete your Consumer Health Data promptly, as soon as
              practicable, except where retention is required for legal,
              safety-audit, or security purposes (for example, records related
              to red-flag safety escalations, which we may retain for
              auditability).
            </p>
          </section>

          <section className="mt-10">
            <h2 className={sectionTitle}>10. Geofencing</h2>
            <p className={proseMuted}>
              Stasus does not collect precise geolocation data, and we do not
              engage in geofencing around health care facilities or any other
              location.
            </p>
          </section>

          <section className="mt-10">
            <h2 className={sectionTitle}>11. Changes to this Policy</h2>
            <p className={proseMuted}>
              If we materially change the categories of Consumer Health Data we
              collect, our purposes for collecting it, or the third parties we
              share it with, we will notify you and, where required, obtain
              renewed consent before the change takes effect.
            </p>
          </section>

          <section className="mt-10">
            <h2 className={sectionTitle}>12. Contact us</h2>
            <p className={proseMuted}>
              For questions about this Policy or to exercise your rights,
              contact the Stasus team through the product channels you already
              use to reach us.
            </p>
          </section>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--stasus-border)] px-6 text-base font-medium text-[var(--stasus-ink)] transition-colors hover:bg-[var(--stasus-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)]"
            >
              Back to home
            </Link>
            <Link
              href="/overview"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--stasus-border)] px-6 text-base font-medium text-[var(--stasus-ink)] transition-colors hover:bg-[var(--stasus-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stasus-aqua)]"
            >
              Overview
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
