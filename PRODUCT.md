# PRODUCT.md

**Stasus** helps people with vestibular symptoms reduce those symptoms and reclaim steadier days — diagnosed or not — as a general wellness product (no diagnose/treat/cure claims).

## Audience

Adults 18–65 with vestibular symptoms (PPPD, BPPV, vestibular migraine, undiagnosed dizziness, post-acute lingering symptoms).

## v1 product pillars

1. **Exercise library** — condition-mapped vestibular rehab (habituation, gaze stabilization, balance, canalith education) with optional **webcam practice** (on-device pose CV; session metadata only — no video stored) and manual practice logging (minutes and/or seconds)
2. **Symptom & trigger tracker** — severity, duration, triggers, notes; interactive severity trend (entry/day windows)
3. **Calm tools** — hypervigilance / anxiety reduction (grounding, breathing, etc.)
4. **AI notes** — daily (after each non–red-flag log), weekly, and monthly via **Anthropic direct** (not InsForge Model Gateway); standing medical disclaimer; red-flag escalation to emergency cues
5. **Web/PWA** — intended host **InsForge Sites** (not Vercel); **dark-only** UI (no light theme / theme toggle); motion-safe
6. **Usage metrics** — personal activity strip + admin DAU/WAU/MAU (`/app/admin/usage`, allowlisted emails) from meaningful actions in each user’s local timezone

## Account & safety (shipped)

- Email/password auth with **email verification** and **forgot-password** reset (InsForge auth email)
- **Delete account** from the home dashboard — removes auth user and cascaded app data
- Server-side AI rate limits, note sanitization, and tightened RLS on `ai_insights` / `ai_call_log` (trusted writes only)

## Non-goals (v1)

EEG/BCI, native apps, clinic multi-practitioner workspace, FDA clinical-use version.
