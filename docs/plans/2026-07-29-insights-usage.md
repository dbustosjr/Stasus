# Insights Cadence + Usage Metrics Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend Insights with local-timezone daily AI notes (after each symptom log, with wellness suggestions), monthly AI letters, personal + admin DAU/WAU/MAU from meaningful activity, and a standing medical disclaimer on every note — without changing the weekly note pipeline’s core behavior.

**Architecture:** Approach A from `docs/plans/2026-07-29-insights-usage-design.md`. Migrate `ai_insights` to support `cadence` + `period_start` + `source_log_id`; add `user_activity_days` and `profiles.timezone`. Stamp activity on symptom log / exercise session / calm breathing completion. Generate daily notes in `createSymptomLog` (skip on red-flag). Add monthly cron edge function. Insights UI gains activity strip + Daily/Weekly/Monthly sections.

**Tech Stack:** Next.js App Router, InsForge Postgres + RLS, Anthropic (Haiku daily / existing weekly Haiku→Sonnet / Sonnet monthly), InsForge Edge Functions + schedules, TypeScript.

**Design doc:** `docs/plans/2026-07-29-insights-usage-design.md`

---

### Task 1: Migration — timezone + activity + ai_insights cadence

**Files:**
- Create: `migrations/YYYYMMDDHHMMSS_insights-cadence-and-usage.sql` (timestamp via InsForge CLI when applying)
- Reference: `migrations/20260728025913_create-ai-safety-tables.sql`
- Reference: `migrations/20260728015028_create-profiles.sql`

**Step 1: Write SQL migration**

```sql
-- profiles.timezone (IANA)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'UTC';

-- user_activity_days
CREATE TABLE public.user_activity_days (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  sources JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, activity_date)
);

ALTER TABLE public.user_activity_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_activity_days_select_own"
  ON public.user_activity_days FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "user_activity_days_upsert_own"
  ON public.user_activity_days FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "user_activity_days_update_own"
  ON public.user_activity_days FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE ON public.user_activity_days TO authenticated;
REVOKE DELETE ON public.user_activity_days FROM authenticated;
REVOKE ALL ON public.user_activity_days FROM anon;

-- ai_insights cadence extension
ALTER TABLE public.ai_insights
  ADD COLUMN IF NOT EXISTS cadence TEXT NOT NULL DEFAULT 'weekly',
  ADD COLUMN IF NOT EXISTS period_start DATE,
  ADD COLUMN IF NOT EXISTS source_log_id UUID REFERENCES public.symptom_logs(id) ON DELETE SET NULL;

UPDATE public.ai_insights
SET period_start = week_start
WHERE period_start IS NULL;

ALTER TABLE public.ai_insights
  ALTER COLUMN period_start SET NOT NULL;

-- Backfill cadence already default weekly
ALTER TABLE public.ai_insights
  DROP CONSTRAINT IF EXISTS ai_insights_user_id_week_start_key;

CREATE UNIQUE INDEX IF NOT EXISTS ai_insights_weekly_unique
  ON public.ai_insights (user_id, period_start)
  WHERE cadence = 'weekly';

CREATE UNIQUE INDEX IF NOT EXISTS ai_insights_monthly_unique
  ON public.ai_insights (user_id, period_start)
  WHERE cadence = 'monthly';

CREATE UNIQUE INDEX IF NOT EXISTS ai_insights_daily_log_unique
  ON public.ai_insights (source_log_id)
  WHERE source_log_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ai_insights_user_cadence_period
  ON public.ai_insights (user_id, cadence, period_start DESC);

ALTER TABLE public.ai_insights
  ADD CONSTRAINT ai_insights_cadence_check
  CHECK (cadence IN ('daily', 'weekly', 'monthly'));
```

**Step 2: Apply migration**

Run: `npx @insforge/cli db query --file <migration>` or project’s usual migrate path per `insforge-cli` skill.

**Step 3: Commit**

```bash
git add migrations/*.sql docs/plans/2026-07-29-insights-usage-design.md
git commit -m "$(cat <<'EOF'
Add schema for insight cadences, activity days, and timezone.

EOF
)"
```

---

### Task 2: Shared disclaimer + local date helpers

**Files:**
- Create: `src/lib/ai/disclaimer.ts`
- Create: `src/lib/time/local-calendar.ts`
- Test: `src/lib/time/local-calendar.test.ts` (or existing test runner pattern in repo)

**Step 1: Disclaimer constant**

```ts
export const WELLNESS_REPORT_DISCLAIMER =
  "Stasus is a wellness tool. This note is not medical advice, a diagnosis, or a treatment plan. It does not replace care from a qualified clinician. If you’re worried about your symptoms, talk with your doctor or seek urgent care when appropriate.";

export function withDisclaimer(body: string): string {
  const trimmed = body.trim();
  if (trimmed.includes("not medical advice")) return trimmed;
  return `${trimmed}\n\n—\n${WELLNESS_REPORT_DISCLAIMER}`;
}
```

**Step 2: Local calendar helpers**

Implement using `Intl` / Temporal-free approach:

- `localDateString(timeZone: string, instant = new Date()): string` → `YYYY-MM-DD`
- `localWeekStartMonday(timeZone: string, instant = new Date()): string`
- `localMonthStart(timeZone: string, instant = new Date()): string`

**Step 3: Unit tests** for LA vs New York vs UTC around a known instant.

**Step 4: Commit**

```bash
git add src/lib/ai/disclaimer.ts src/lib/time/
git commit -m "$(cat <<'EOF'
Add wellness disclaimer and local-calendar helpers.

EOF
)"
```

---

### Task 3: Activity stamp + timezone sync

**Files:**
- Create: `src/app/actions/activity.ts` — `recordActivityDay(source: 'symptom_log' | 'exercise' | 'calm')`
- Create: `src/components/timezone-sync.tsx` (client) — posts timezone to server
- Create: `src/app/actions/profile-timezone.ts` — `upsertTimezone(tz: string)`
- Modify: `src/components/app-shell.tsx` — render `<TimezoneSync />`
- Modify: `src/app/actions/tracker.ts` — call `recordActivityDay` after successful log
- Modify: `src/app/actions/sessions.ts` — stamp on successful session save
- Modify: `src/components/breathing-guide.tsx` — call server action once when a full cycle completes (or add `recordCalmUse` button/completion hook)

**Step 1: Implement upsert into `user_activity_days` merging `sources` JSON.**

**Step 2: Wire timezone sync** (validate IANA lightly; reject empty).

**Step 3: Wire three stamp sites.**

**Step 4: Manual smoke** — log symptom, confirm row for local today.

**Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
Record meaningful activity days and sync user timezone.

EOF
)"
```

---

### Task 4: Daily AI after symptom log

**Files:**
- Modify: `src/lib/ai/anthropic.ts` — add `runDailyInsight({ log, timezone })`
- Modify: `src/app/actions/tracker.ts` — after insert, if not red-flag, generate + insert daily `ai_insights`
- Modify: `src/app/actions/insights.ts` — ensure weekly inserts set `cadence: 'weekly'`, `period_start`
- Reference prompts: wellness suggestions only; append disclaimer via `withDisclaimer`

**Step 1: Daily prompt** — short note; suggestions to gently reduce/ease symptoms based on severity/triggers/notes; no diagnosis/meds; point to in-app calm/exercises when relevant.

**Step 2: In `createSymptomLog`**, after insert get `id`; if red-flag path, skip AI; else try/catch AI insert with `cadence: 'daily'`, `period_start: localDate`, `source_log_id`, `week_start: period_start` (satisfy NOT NULL if column still required).

**Step 3: Soft-fail** — never fail the log save because AI failed.

**Step 4: Log `ai_call_log` purpose `daily_insight`.

**Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
Generate daily wellness insight after each symptom log.

EOF
)"
```

---

### Task 5: Weekly path — local week + disclaimer

**Files:**
- Modify: `src/app/actions/insights.ts` — use profile timezone for week bounds; `withDisclaimer` on Sonnet output; set cadence fields
- Modify: `functions/weekly-insights.ts` — per-user timezone week; same fields + disclaimer
- Modify: `src/lib/ai/anthropic.ts` — weekly system prompt mentions disclaimer requirements

**Step 1: Replace UTC week calculation with local Monday–Sunday for that user.**

**Step 2: Redeploy** `weekly-insights` with `npx @insforge/cli functions deploy weekly-insights --file ./functions/weekly-insights.ts --yes`

**Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
Align weekly insights with local timezone and disclaimer.

EOF
)"
```

---

### Task 6: Monthly insight generation + cron

**Files:**
- Modify: `src/lib/ai/anthropic.ts` — `runMonthlyInsight`
- Create: `src/app/actions/insights.ts` helpers or separate `generateMonthlyInsight` (manual optional)
- Create: `functions/monthly-insights.ts` — batch like weekly; eligibility: onboarded, ≥1 log in prior local month, no existing monthly row
- Schedule: e.g. daily `0 16 * * *` UTC that generates for users whose local date is the 1st, **or** monthly cron `0 16 1 * *` plus lazy generate on Insights

**Step 1: Implement Sonnet monthly letter (pattern-level, calm, disclaimer).**

**Step 2: Deploy function + schedule via InsForge CLI.**

**Step 3: Document in `AGENTS.md`.**

**Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
Add monthly insight generation and schedule.

EOF
)"
```

---

### Task 7: Insights UI — activity + Daily/Weekly/Monthly

**Files:**
- Modify: `src/app/app/insights/page.tsx`
- Create: `src/components/insights-activity-strip.tsx` (server or client as needed)
- Create: `src/lib/insights/usage.ts` — compute personal activeToday / daysThisWeek / daysThisMonth from `user_activity_days` + timezone
- Modify: copy — keep weekly Generate; list daily/monthly notes; show `WELLNESS_REPORT_DISCLAIMER` under each card (even if also in text)

**Step 1: Query insights by cadence (limit each list).**

**Step 2: Activity strip UI matching dark design system (no cards-for-decoration).**

**Step 3: Manual UI check** light path.

**Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
Show activity strip and daily/weekly/monthly notes on Insights.

EOF
)"
```

---

### Task 8: Admin DAU / WAU / MAU

**Files:**
- Create: `src/app/admin/usage/page.tsx` (protect: allowlist email via env `ADMIN_EMAILS` or similar)
- Create: `src/lib/insights/platform-usage.ts` — compute platform DAU/WAU/MAU respecting each user’s local “today/week/month” (server-side with admin client or batched query)
- Update: `.env.example` with `ADMIN_EMAILS`

**Step 1: Gate route** — if user email not in allowlist, `notFound()`.

**Step 2: Display three numbers + short definition (“meaningful actions only”).**

**Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
Add admin usage page for platform DAU/WAU/MAU.

EOF
)"
```

---

### Task 9: Docs + PRODUCT.md sync

**Files:**
- Modify: `PRODUCT.md` — AI includes daily/weekly/monthly; dark-only; webcam exists
- Modify: `AGENTS.md` — monthly cron + disclaimer note
- Modify: `DESIGN.md` if Insights patterns need a line

**Step 1: Update docs.**

**Step 2: Commit**

```bash
git commit -m "$(cat <<'EOF'
Document insights cadences and usage metrics.

EOF
)"
```

---

### Task 10: Verification

**Step 1:** `npx next build`

**Step 2:** Manual:
- Set TZ to America/Los_Angeles in profile via sync
- Create symptom log → daily note appears; disclaimer present; suggestions present
- Red-flag path → no daily note
- Exercise session → activity day stamped
- Insights strip updates
- Weekly generate still works
- Admin page shows counts when allowlisted

**Step 3:** Final commit only if fixes needed.

---

## Execution handoff

After this plan is saved, implement with **executing-plans** (or subagent-driven-development) task-by-task. Do not start coding until the user asks to implement.
