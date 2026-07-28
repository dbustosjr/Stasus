# Weekly Insights Cron Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deploy an InsForge Edge Function that batch-generates weekly insights, triggered by a Monday cron schedule.

**Architecture:** Schedule POSTs to `weekly-insights` with a cron bearer secret. Function uses admin API access, Haiku→Sonnet, upserts `ai_insights`. Manual UI Generate remains.

**Tech Stack:** Deno Edge Function, `@insforge/sdk`, Anthropic HTTP API (or `npm:@anthropic-ai/sdk`), InsForge schedules/secrets

**Design:** @docs/plans/2026-07-28-weekly-insights-cron-design.md

---

### Task 1: Edge function source

**Files:**
- Create: `functions/weekly-insights.ts`

Handler: OPTIONS/CORS; require `Authorization: Bearer <CRON_SECRET>`; list eligible users; process up to 40; return summary JSON.

### Task 2: Deploy function + secrets + schedule

- `secrets add CRON_SECRET` (generated)
- `secrets add ANTHROPIC_API_KEY` from local env if not already present
- `functions deploy weekly-insights`
- `schedules create --name weekly-insights --cron "0 15 * * 1" --url …/functions/weekly-insights --method POST --headers with cron secret`

### Task 3: Document + memory + smoke invoke

- Note in AGENTS.md
- Optional dry-run invoke with curl + secret
- `memory remember` decision
