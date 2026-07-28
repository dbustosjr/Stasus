# Weekly Insights Cron — Design

**Date:** 2026-07-28  
**Status:** Approved  
**Approach:** InsForge Edge Function + Monday schedule (A)

## Goal

Automatically generate weekly wellness insights for onboarded users who logged symptoms that week, without requiring them to open Insights and click Generate.

## Architecture

```
InsForge Schedule (Mon 15:00 UTC)
  → POST /functions/weekly-insights
       Authorization: Bearer ${{secrets.CRON_SECRET}}
  → Deno Edge Function
       → admin API_KEY client
       → eligible profiles (onboarding_complete, has logs this week, no insight yet)
       → Haiku → Sonnet → upsert ai_insights + ai_call_log
  → JSON summary { processed, skipped, failed }
```

Manual Generate (Next.js server action) remains for demos/debugging.

## Eligibility

- `profiles.onboarding_complete = true`
- ≥1 `symptom_logs` row in current Monday–Sunday UTC week
- No existing `ai_insights` row for `(user_id, week_start)`

## Secrets

- `CRON_SECRET` — schedule bearer
- `ANTHROPIC_API_KEY` — model calls
- Optional: `ANTHROPIC_HAIKU_MODEL`, `ANTHROPIC_SONNET_MODEL`
- `INSFORGE_BASE_URL` / `API_KEY` — auto-injected into Edge Functions

## Non-goals

- Email/push when insight ready
- Per-user timezone
- Tightening `ai_insights` RLS in this slice
