# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Adults (about 18–65) living with vestibular symptoms — PPPD, BPPV, vestibular migraine, undiagnosed dizziness, or post-acute lingering symptoms — whether or not they have a formal diagnosis. Their job is to notice what flares, practice mapped rehab that fits, ease the checking loop, and get a gentle look at patterns without chasing scores or seeking a diagnosis from the app.

## Product Purpose

Stasus is a general wellness product that helps people with vestibular symptoms reclaim steadier days. Success means people can log what they notice, practice what fits, use short calm tools when hypervigilance spikes, and receive plain-language AI notes (daily / weekly / monthly) with standing medical disclaimers — without the product claiming to diagnose, treat, or cure.

## Positioning

A calm, personal vestibular wellness space: condition-mapped exercise guidance with optional on-device webcam practice (session metadata only; no video stored), symptom/trigger tracking with interactive trends, calm tools for fear-avoidance spirals, and Anthropic-direct AI notes (not InsForge Model Gateway). Hosted as a dark-only, motion-safe web/PWA on InsForge Sites. Neighboring fitness or generic symptom apps cannot truthfully claim this vestibular-specific, metadata-only camera practice plus pattern notes stance without inventing clinical authority Stasus deliberately refuses.

## Operating Context

- Used in a browser or as a home-screen PWA, often during or after symptom days when attention and motion tolerance are limited.
- Email/password auth with email verification and password reset (InsForge auth email).
- In-app areas: home, exercises (including optional CV practice and manual session logging), symptom tracker (with archive), calm tools, insights, data export (CSV/PDF), account delete.
- Admin usage (DAU/WAU/MAU) at `/app/admin/usage` for allowlisted emails, based on meaningful actions in each user’s local timezone.
- Weekly insights also runnable via scheduled edge function; manual generate remains on Insights.
- Live marketing site: InsForge Sites (`*.insforge.site`).

## Capabilities and Constraints

**Shipped / confirmed**

- Exercise library: habituation, gaze stabilization, balance training, canalith education (no DIY canalith maneuvers as user-performed content).
- Optional webcam practice: on-device pose/face CV; metadata only; nothing recorded to storage.
- Symptom logs: severity, duration, triggers, notes; archive; interactive severity trend (entry/day windows).
- Calm tools for hypervigilance / checking loops.
- AI notes: daily (after eligible logs), weekly, monthly via Anthropic API; rate limits; sanitization; red-flag path to emergency cues; wellness disclaimer.
- Data export: symptom logs (including archived) + practice sessions as CSV/PDF; share-or-download on mobile.
- Auth: verification, forgot password, delete account (cascaded app data).
- Dark-only UI; motion-safe defaults; honor reduced motion.

**Hosting / infra**

- Backend: InsForge (Postgres, auth, storage, functions, secrets).
- Frontend host: InsForge Sites (not Vercel as the product host of record).
- AI: Anthropic direct only for Stasus product AI.

**Non-goals (v1)**

- EEG/BCI
- Native iOS/Android apps
- Clinic multi-practitioner workspace
- FDA clinical-use / diagnose-treat-cure positioning

## Brand Commitments

- Name: **Stasus**
- Voice: calm, human, plain language; avoid brochure jargon and clinical overclaim.
- Assets: `/public/brand/` dark lockups/marks; do not invert with CSS filters.
- Visual system authority for UI tokens lives in `DESIGN.md` (dark-only teal/aqua editorial calm). Init does not redefine the visual world.

## Evidence on Hand

- Marketing landing with click-to-play webcam practice demo (`/public/demo/webcam-practice.mp4`, poster); no autoplay.
- In-product exercise content, tracker, calm tools, insights, export, and admin usage as implemented in this repo.
- No fabricated testimonials, clinical outcomes, or third-party endorsements on hand — do not invent them in future work.

## Product Principles

1. **Wellness, not clinic** — support noticing and practice; never diagnose, treat, cure, or grade the person.
2. **Calm by design** — motion-safe, dark-only, low pressure; especially when symptoms and checking urges are high.
3. **Privacy-respecting practice** — optional camera stays local; metadata only; clear “nothing recorded” messaging.
4. **Pattern over noise** — weekly (and related) notes in plain language; no reactive lecture after every entry.
5. **User ownership** — export and delete are first-class; data stays accountable to the account holder.

## Accessibility & Inclusion

- Motion-safe defaults; respect `prefers-reduced-motion`.
- Aim for usable contrast on the dark palette; keyboard-focusable controls and skip-to-content patterns in the app shell.
- Copy and flows should remain usable when attention, balance, or screen time tolerance is limited (short steps, clear exits, no surprise autoplay or camera prompts).
