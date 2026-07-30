# Daily / Weekly / Monthly Insights + Usage Metrics — Design

**Date:** 2026-07-29  
**Status:** Approved  
**Approach:** A — extend `ai_insights` + `user_activity_days`

## Goals

- Keep **weekly** notes as they work today (manual Generate + Monday cron, human voice).
- After **each symptom log**, generate a **daily** AI note with wellness-only **suggestions and recommendations** grounded in that entry (severity, duration, triggers, notes).
- Add a **monthly** AI pattern letter (usage + monthly note).
- Track **DAU / WAU / MAU** for **both** founders (platform totals) and each user (personal activity strip).
- “Active” = meaningful action: symptom log, exercise session, or calm tool use.
- Bucket all periods in the **user’s local timezone** (IANA, e.g. `America/Los_Angeles`).
- Put a **standing medical disclaimer** on every daily / weekly / monthly note — wellness now and forever, including future clinical phases.

## Non-goals

- Third-party product analytics vendors for v1.
- Diagnosis, medication advice, or treatment plans in any AI note.
- Daily AI when a red-flag redirect fires.
- Changing existing weekly prompt voice beyond adding the shared disclaimer.

## Product shape (Insights)

1. **Your activity** — personal strip: active today? / days this week / days this month (local TZ).
2. **Notes** — sections or tabs: Daily · Weekly · Monthly.
3. **Disclaimer** under every note (UI + generation).

**Admin:** platform DAU/WAU/MAU from `user_activity_days` (internal page or queryable totals). Not shown as product totals to end users.

## Data model

### `profiles.timezone`

- `TEXT NOT NULL DEFAULT 'UTC'` (or nullable until first client sync).
- IANA name from `Intl.DateTimeFormat().resolvedOptions().timeZone` on app shell / login.
- Used for activity day keys, weekly Monday, monthly month-start, and cron eligibility.

### `user_activity_days`

| Column | Type | Notes |
|--------|------|--------|
| `user_id` | UUID FK → auth.users | |
| `activity_date` | DATE | Local calendar day for that user |
| `sources` | JSONB optional | e.g. `{ "symptom_log": true, "exercise": true }` |
| `updated_at` | TIMESTAMPTZ | |

- `UNIQUE (user_id, activity_date)`
- RLS: user SELECT own; INSERT/UPDATE own (or server-only upsert)
- Stamp on: symptom log create, exercise session save, calm tool completion (define one calm “use” event)

**Metrics**

- Personal: count distinct days in local week / month; “active today” = row for today.
- Platform DAU: users with `activity_date = today_in_their_tz` is hard in one SQL pass — v1 options: (a) store `activity_date` already localized at write time and compute “today” per user in app, or (b) admin job aggregates last 24h of events. **v1 choice:** store local `activity_date` at write; platform DAU = count users whose `activity_date` equals *their* today (query with join to `profiles.timezone` or nightly rollup table). Simpler v1 admin: rolling counts from last N UTC days of writes plus note that buckets are local — **preferred v1:** maintain `activity_date` as local date at event time; admin DAU = `COUNT(DISTINCT user_id) WHERE activity_date = CURRENT_DATE` is wrong across zones. **Implementation:** admin endpoints compute DAU as distinct users with an activity row for “their today” via SQL using `profiles.timezone`, or a small server loop. WAU/MAU = distinct users with ≥1 day in their local week/month.

### `ai_insights` extension

| Column | Type | Notes |
|--------|------|--------|
| `cadence` | TEXT | `daily` \| `weekly` \| `monthly` |
| `period_start` | DATE | Local day / local week Monday / local month 1st |
| `source_log_id` | UUID NULL FK → symptom_logs | Required uniqueness for daily |
| `week_start` | DATE | **Keep** for backward compat; for weekly rows equals `period_start`; migrate existing |

Constraints:

- Weekly: unique `(user_id, cadence, period_start)` where cadence = weekly (existing week uniqueness).
- Monthly: unique `(user_id, cadence, period_start)`.
- Daily: unique `(source_log_id)` where not null (one note per log).

Migrate existing rows: `cadence = 'weekly'`, `period_start = week_start`.

## Generation flows

### Daily (after symptom log)

1. Insert `symptom_logs`; stamp `user_activity_days`.
2. If red-flag → insert audit → redirect `/emergency` → **no AI**.
3. Else call Haiku (preferred for cost/latency) with entry JSON → short note: acknowledge patterns gently + **actionable wellness suggestions** (pace, trigger awareness, point to calm/exercises in-app when relevant).
4. Append/require standard disclaimer in text or UI (both).
5. Insert `ai_insights` daily row + `ai_call_log`.
6. Soft-fail: log succeeds if AI fails; optional toast “note unavailable”.

### Weekly

- Unchanged pipeline (Haiku analysis → Sonnet prose); add disclaimer to prompt + UI.
- Cron + manual Generate; period keys in **user local** week (Monday start in local TZ).

### Monthly

- Cron early month (or lazy on Insights if prior month missing): Sonnet letter from that month’s logs in local TZ.
- Same safety rules + disclaimer.

## Disclaimer (canonical copy)

Use consistently in UI and prompts (minor wording polish OK):

> Stasus is a wellness tool. This note is not medical advice, a diagnosis, or a treatment plan. It does not replace care from a qualified clinician. If you’re worried about your symptoms, talk with your doctor or seek urgent care when appropriate.

Retain this on every report through clinical phases.

## UI

- `/app/insights`: activity strip; Daily / Weekly / Monthly sections.
- Daily list newest first; show suggestions body; disclaimer footer per card or page-level under each.
- Weekly Generate button retained.
- Monthly: list + empty state until first letter exists.

## Admin

- Minimal authenticated admin route or InsForge-only query docs for platform DAU/WAU/MAU from `user_activity_days` + timezones.
- No PHI in admin aggregates beyond counts.

## Safety

- No diagnosis / meds / treatment plans in prompts.
- Skip daily AI on emergency path.
- Rate awareness: one daily call per log; consider soft cap later if abuse appears.

## Open implementation notes

- Calm “use” event: first completion of breathing guide or explicit calm session stamp — pick one in plan.
- Weekly cron currently UTC Monday — update to per-user local week boundary.
