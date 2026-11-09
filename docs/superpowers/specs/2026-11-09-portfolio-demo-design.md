# Portfolio Demo Mode — Design

**Date:** 2026-11-09  
**Status:** Approved (pending final user review of this doc)  
**Audience:** Investors and employers reviewing Stasus as a portfolio product  
**Live URL target:** Landing **Try demo** → `/demo` (no signup)

## Goal

Let anyone explore a **full-fidelity** Stasus product experience without creating an account. The demo must match today’s web app UI/UX (including the mobile native-like tab bar and flows). It is a capability/quality showcase — **not** a signup funnel (no pressure CTAs).

## Non-goals

- Pressuring visitors to sign up
- Mutating production InsForge data, auth, or AI/cron systems
- Shipping a reduced “marketing mock” that omits real camera/calm/UI behavior
- Exposing Personal Admin, account deletion, or live export APIs as working production paths

## Decisions (locked)

1. **Approach:** Parallel `/demo` app tree (not demo-cookie on `/app`).
2. **Hybrid realism:** Camera + calm + core UI run for real; AI insights and historical depth come from high-quality sample fixtures (Generate uses fixture pool, no live Anthropic).
3. **Entry:** Straight into demo Home already “onboarded” with a sample persona.
4. **Isolation:** Demo must never share auth gates, server actions that write user data, DB writes, or AI/cron with the live app — clean separation to prevent live product breakage.

## Architecture

### Hard boundary

| Concern | Live (`/app`) | Demo (`/demo`) |
|---|---|---|
| Auth | `requireUser` / `requireOnboarded` | Public; no auth |
| Data writes | InsForge + live server actions | Demo repository only |
| AI / crons | Anthropic + edge functions | Sample insight fixtures only |
| Account / admin / research DB | Real | Hidden or inert; no production writes |
| Camera / calm client UX | Real MediaPipe + steppers | Same shared client components |

### Code layout

- `src/app/demo/**` — parallel App Router pages (Home, Exercises, detail, practice, Tracker, Calm, Insights). **Do not** fork live pages into “if demo” branches inside `/app`.
- `src/lib/demo/**` — seed fixtures, session store, demo adapters/repositories. Names and file headers make “demo-only” obvious.
- Shared **presentational** UI remains shared: `AppShell`, nav/tab bar (with configurable `basePath`), practice coach, calm steppers, tracker form chrome, etc.
- Live pages continue to import only live actions (`src/app/actions/*`). Demo pages import only `src/lib/demo/*` adapters.
- Prefer **demo pages + adapters** over sprinkling `if (isDemo)` through core domain modules.

### Shell / navigation

- Demo layout wraps the same chrome as `/app` with `basePath="/demo"` so all tab/nav links stay under `/demo/*`.
- Extend `appTabFromPathname` / `isAppChromePath` (or demo-specific helpers) to recognize `/demo` the same way as `/app` (excluding any future demo-only dead ends if added).
- Quiet **Demo** badge in chrome + **Exit demo** → `/` (informational only; no signup push copy).
- Account menu in demo: limited — no delete-account, no admin, no real privacy DB revoke. Optional inert “Demo session” label instead of a real email, or a clearly fake sample email string that cannot auth.

### Landing

- Add **Try demo** on the landing hero CTA group (alongside Begin gently / Sign in).
- Link: `/demo`. Tone: calm product invitation, not sales urgency.

## UX surface (parity)

Visitors can use the same primary flows as today’s product:

1. **Home** — welcome, suggested categories, protocol panel (demo store), recent practice, research prompt either omitted or purely local/no-op (no DB consent write).
2. **Exercises** — list + detail matching live library presentation; practice entry.
3. **Practice** — camera with/without feedback using existing `PracticeCoach` / MediaPipe; session save writes to demo store only (metadata), never InsForge `exercise_sessions`.
4. **Tracker** — list + new log; severity/duration/triggers/notes against demo store.
5. **Calm** — real guided steppers / breathing; completion stamps demo activity only.
6. **Insights** — daily/weekly/monthly from fixtures; Generate adds from a small fixture pool (no Anthropic). Outcome-trend style panels may use seeded demo trend data so Insights looks lived-in.

### Sample persona

- Adult managing vestibular symptoms (neutral, non-dramatic).
- Onboarded with suggested categories, at least one active protocol, recent sessions, multi-day symptom history, and polished daily/weekly/monthly notes already present.

### Explicitly out of demo

- Signup / login / onboarding gates as requirements to enter
- Live account delete
- Live CSV/PDF export API routes as production data export
- Personal Admin (`ADMIN_EMAILS`)
- Research consent persistence to InsForge
- Live AI generation and weekly/monthly cron side effects

## Data layer

### Seed + session store

- Fixtures under `src/lib/demo/fixtures/` (or equivalent) for profile, logs, sessions, protocols, insights, calm stamps.
- Exercise catalog: prefer reading the same exercise content source the live app uses **read-only** where safe; if that requires auth/DB, use a frozen demo catalog snapshot that matches live titles/categories so the showcase stays accurate without depending on RLS.
- Runtime mutations in **`sessionStorage`** keyed under a clear prefix (e.g. `stasus.demo.v1`). New logs, practice saves, protocol start/end, Generate-appended notes merge onto seed.
- Corrupt/missing storage → re-seed from fixtures (fail closed to a good demo, not a blank break).

### Insights Generate

- Does not call Anthropic.
- Appends the next unused sample note from a fixture pool (or rotates), stamped with demo period labels so the UI feels responsive.

## Safety & anti-conflict rules

1. **No InsForge user writes** from demo routes or demo adapters.
2. **No imports** of live mutating server actions from `src/app/demo/**`.
3. Demo layout must **not** call `requireUser`.
4. Review/grep gate before ship: `requireUser`, `requireOnboarded`, `createSymptomLog`, `saveCameraPracticeSession`, Anthropic clients, admin export — must not appear as live write paths under demo.
5. Live `/app` behavior unchanged: logged-out users still redirect to login.
6. Camera remains on-device; demo does not introduce new video upload/storage.

## Failure modes

- Camera permission denied → same honest live copy.
- MediaPipe load failure → same feedback fallback; preview path still works.
- sessionStorage unavailable → in-memory fallback for the tab session, or re-seed each load with a clear Demo note that persistence is limited.

## Verification

- Manual: Landing → Try demo → Home → all tabs → log symptom → calm guide → exercise practice (feedback + preview) → Insights Generate → Exit demo.
- Build: demo routes compile; `/app` still auth-gated.
- Regression: existing CV/tracker/insights live paths smoke-checked after shell `basePath` changes.
- Grep/review isolation checklist above.

## Implementation notes (for plan)

- Refactor nav/tab/shell to accept `basePath` (default `/app`) so demo and live share one chrome implementation.
- Practice entry links and in-app Links that hardcode `/app/...` need basePath-aware helpers when rendered in demo.
- Keep demo code obviously named (`DemoAppShell`, `demo-store`, `fixtures`) for future maintainers and portfolio code review.

## Success criteria

- A visitor can experience Stasus end-to-end without signup.
- Visual/interaction fidelity matches today’s product chrome and flows.
- Live product cannot be broken by demo data paths (isolation holds under review).
- Demo reads as a serious product demo for investors/employers — quiet Demo badge, no signup pressure.
