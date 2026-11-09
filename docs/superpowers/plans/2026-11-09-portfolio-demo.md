# Portfolio Demo Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a no-signup `/demo` experience that mirrors today’s Stasus `/app` UI/UX for portfolio/investor review, with hard isolation from live auth, DB writes, and AI.

**Architecture:** Parallel `src/app/demo/**` route tree reuses shared chrome/UI via a configurable `basePath`. Demo data lives in `src/lib/demo/**` (fixtures + `sessionStorage`). Camera/calm use existing client components; practice/tracker persistence is injected so live server actions are never called from demo. Insights use fixture text only (no Anthropic).

**Tech Stack:** Next.js App Router, existing Stasus UI components, `sessionStorage`, MediaPipe (unchanged), node strip-types tests (repo style).

**Spec:** `docs/superpowers/specs/2026-11-09-portfolio-demo-design.md`

## Global Constraints

- Demo never imports live mutating server actions for persistence (`sessions`, `tracker` writes, `insights` generate, `account` delete, `research-consent` DB, `protocols` InsForge writes, admin exports).
- Demo layout never calls `requireUser` / `requireOnboarded`.
- No signup-pressure CTAs in demo chrome.
- Quiet “Demo” badge + Exit → `/` only.
- Prefer dependency injection / demo adapters over `if (isDemo)` inside core domain modules.
- Exercise catalog for demo is a **frozen fixture snapshot** (exercises table is auth-gated; do not couple demo entry to InsForge auth).
- Session mutations use `sessionStorage` key prefix `stasus.demo.v1`.

---

## File map

| Path | Responsibility |
|---|---|
| `src/lib/demo/types.ts` | Demo domain types (profile, log, session, protocol, insight) |
| `src/lib/demo/fixtures/*` | Seed JSON/TS for persona, exercises snapshot, logs, insights |
| `src/lib/demo/store.ts` | Load/merge/save sessionStorage; re-seed on corrupt |
| `src/lib/demo/paths.ts` | `demoPath(suffix)` helper → `/demo/...` |
| `src/lib/nav/app-tab.ts` | Recognize `/demo` like `/app` for chrome |
| `src/components/app-nav.tsx` | `basePath` prop (default `/app`) |
| `src/components/app-tab-bar.tsx` | `basePath` prop |
| `src/components/app-shell.tsx` | `basePath`, demo badge, Exit demo, limited account area |
| `src/components/cv/practice-camera-entry.tsx` | Optional `basePath` for practice href |
| `src/components/cv/practice-coach.tsx` | Optional `persistSession` inject (default live action) |
| `src/app/demo/layout.tsx` | Public demo shell; no auth |
| `src/app/demo/**/page.tsx` | Parallel pages |
| `src/app/page.tsx` | Landing **Try demo** → `/demo` |
| `scripts/test-demo-store.mjs` | Store merge/re-seed tests |

---

### Task 1: Demo store + fixtures + tests

**Files:**
- Create: `src/lib/demo/types.ts`
- Create: `src/lib/demo/fixtures/exercises.ts` (frozen snapshot of live library shape: `Exercise[]`, enough entries across all 4 categories; include CV-flagged titles that match `resolveCvTrackMode`)
- Create: `src/lib/demo/fixtures/seed.ts` (profile, symptom logs ~7–14 days, sessions, one active protocol, calm stamps, daily/weekly/monthly insights, optional outcome-trend-shaped summary)
- Create: `src/lib/demo/store.ts`
- Create: `src/lib/demo/paths.ts`
- Create: `scripts/test-demo-store.mjs`
- Modify: `package.json` — add `"test:demo-store": "node --experimental-strip-types scripts/test-demo-store.mjs"`

**Interfaces:**
- Produces:
  - `demoPath(path?: string): string` — `demoPath()` → `/demo`; `demoPath("/exercises")` → `/demo/exercises`
  - `getDemoState(): DemoState` / `saveDemoState(state: DemoState): void` / `resetDemoState(): DemoState`
  - `addDemoSymptomLog(...)`, `addDemoSession(...)`, `upsertDemoProtocol(...)`, `appendDemoInsight(...)`
  - `DemoState` includes `profile`, `exercises`, `symptomLogs`, `sessions`, `protocols`, `insights`, `calmCompletions`

- [ ] **Step 1: Write failing store tests** (merge log, corrupt JSON re-seeds, insight append)

- [ ] **Step 2: Implement fixtures + store** (browser `sessionStorage` guarded; for node tests, inject a memory map or test the pure merge helpers)

- [ ] **Step 3: Run** `npm run test:demo-store` — pass

- [ ] **Step 4: Commit** (only if user asked for commits; otherwise stop and note ready)

---

### Task 2: Chrome `basePath` + demo-aware tab helpers

**Files:**
- Modify: `src/lib/nav/app-tab.ts` — `appTabFromPathname` / `isAppChromePath` treat `/demo` like `/app` (exclude `/demo` onboarding if none)
- Modify: `src/components/app-nav.tsx` — accept `basePath?: string` default `"/app"`; build hrefs from it; prefetch those hrefs
- Modify: `src/components/app-tab-bar.tsx` — same `basePath`
- Modify: `src/components/app-shell.tsx` — props: `basePath?: string`, `demo?: boolean`, `email?: string | null`, `showAdmin?: boolean`; when `demo`, show quiet Demo badge + Exit link to `/`, hide admin, do not show delete-account flows (AccountMenu may need a `variant="demo"` or `demo` prop)
- Modify: `src/components/account-menu.tsx` — when demo: only Exit / optional Privacy link to `/privacy/health-data` public page; no delete, no admin, no `/app/privacy` DB consent
- Modify: `src/components/cv/practice-camera-entry.tsx` — `basePath?: string` default `"/app"` for practice URL
- Modify: live `src/app/app/layout.tsx` — unchanged behavior (`basePath` default)

**Interfaces:**
- Consumes: existing shell
- Produces: shared chrome that works for `/app` and `/demo` without duplicating nav markup

- [ ] **Step 1: Refactor nav/tab/shell for `basePath`**

- [ ] **Step 2: Smoke live `/app` logged-out still redirects** (or reason about layout still calling `requireUser`)

- [ ] **Step 3: Commit if requested**

---

### Task 3: Demo layout + landing CTA

**Files:**
- Create: `src/app/demo/layout.tsx` — client or server wrapper rendering `AppShell` with `basePath="/demo" demo email="demo@stasus.app" showAdmin={false}`; **no** `requireUser`
- Create: `src/app/demo/loading.tsx` — reuse/adapt app loading skeleton
- Modify: `src/app/page.tsx` — add **Try demo** link to `/demo` in hero CTA row (calm weight; not a signup pitch)

- [ ] **Step 1: Add demo layout + landing button**

- [ ] **Step 2: Visually check landing CTA on mobile/desktop**

---

### Task 4: Demo pages — Home, Exercises, detail

**Files:**
- Create: `src/app/demo/page.tsx` — Home mirroring live structure (welcome, suggested categories from seed profile, `ProtocolPanel` fed by demo adapters or a demo-specific protocol panel that calls store)
- Create: `src/app/demo/exercises/page.tsx` — list from `fixtures/exercises` (via store)
- Create: `src/app/demo/exercises/[id]/page.tsx` — detail + `PracticeCameraEntry` with `basePath="/demo"`; manual log form if live has one — wire to demo store client action helper
- Create: `src/lib/demo/protocol-actions.ts` (client-safe helpers, not `"use server"` InsForge) for start/end protocol in store
- Prefer extracting small presentational chunks from live home/exercises only if duplication is painful; otherwise parallel pages that copy markup and swap data source is OK for isolation clarity

**Interfaces:**
- Demo Home must not import `ResearchConsentPrompt` that writes InsForge — omit or replace with nothing
- Protocol UI: if `ProtocolPanel` is tightly coupled to server actions, add optional callbacks or a `DemoProtocolPanel`

- [ ] **Step 1: Implement Home + Exercises list/detail against demo store**

- [ ] **Step 2: Click-through: `/demo` → exercises → detail; links stay under `/demo`**

---

### Task 5: Practice coach persistence injection + demo practice page

**Files:**
- Modify: `src/components/cv/practice-coach.tsx` — add optional `persistSession?: (formData: FormData) => Promise<SessionFormState>` and optional `backHref`; when `persistSession` provided, use it instead of `saveCameraPracticeSession`; default remains live action
- Create: `src/app/demo/exercises/[id]/practice/page.tsx` — same practice page UX; pass `persistSession` that writes `addDemoSession` via a tiny client wrapper component if the page is server-rendered
- Create: `src/components/demo/demo-practice-coach.tsx` — thin client wrapper that binds store persist + `basePath` back link

- [ ] **Step 1: Add inject hook to PracticeCoach (live default unchanged)**

- [ ] **Step 2: Demo practice page uses wrapper; verify live practice still uses default action**

- [ ] **Step 3: Manual: Start with feedback / without feedback on demo exercise**

---

### Task 6: Demo Tracker + Calm

**Files:**
- Create: `src/app/demo/tracker/page.tsx` + `src/app/demo/tracker/new/page.tsx`
- Create: `src/components/demo/demo-tracker-form.tsx` (or inject save into existing form component similarly to practice)
- Inspect live tracker form components; prefer optional `onSave` inject over forking entire form UI
- Create: `src/app/demo/calm/page.tsx` — reuse calm guided components; on complete, stamp demo store (inject if calm currently calls server `activity` action)

- [ ] **Step 1: Demo tracker list + create log (sessionStorage)**

- [ ] **Step 2: Demo calm completions stamp store only**

- [ ] **Step 3: Confirm live tracker/calm still hit InsForge actions**

---

### Task 7: Demo Insights (fixtures + fake Generate)

**Files:**
- Create: `src/app/demo/insights/page.tsx` — mirror live Insights layout using store insights + seeded outcome blurb
- Create: `src/components/demo/demo-generate-insight-button.tsx` — appends next fixture insight; **does not** import Anthropic or live `GenerateInsightButton` server path
- Fixture pool: ≥2 extra weekly/daily samples for Generate to feel responsive

- [ ] **Step 1: Insights page with sample notes**

- [ ] **Step 2: Generate appends fixture; no network to Anthropic**

---

### Task 8: Isolation verification + polish polish

**Files:**
- Create: `scripts/check-demo-isolation.mjs` (optional) — fail if `src/app/demo/**` contains imports of `requireUser`, `requireOnboarded`, or known live write actions
- Modify: landing only as needed for CTA spacing
- Manual checklist from spec

- [ ] **Step 1: Grep/isolation script — clean**

- [ ] **Step 2: Full manual walkthrough (landing → all demo tabs → camera → log → calm → Generate → Exit)**

- [ ] **Step 3: Confirm logged-out `/app` still redirects to login**

- [ ] **Step 4: Deploy only when user asks**

---

## Out of scope (do not implement)

- Demo signup CTAs / paywalls
- Live AI in demo
- Admin, account delete, research consent DB, real export APIs in demo
- Changing production wellness claims copy beyond landing Try demo button

## Execution handoff

After this plan is accepted, implement with **subagent-driven-development** or **executing-plans**, task-by-task, keeping live `/app` green at every chrome refactor step.
