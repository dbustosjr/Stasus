# Longitudinal Phase A Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship Stage 1 longitudinal instrumentation with usable UI and de-identified Personal Admin analytics/export.

**Architecture:** New RLS-backed tables (`protocol_events`, `research_consent`, `outcome_trends`); server actions for user writes; admin reads via service role with de-identified aggregation only; Insights page surfaces latest outcome trend.

**Tech Stack:** Next.js App Router, InsForge Postgres/RLS, existing Anthropic/insights patterns (outcome compute starts deterministic).

---

### Task 1: Migrations
Create and apply migration for the three tables + grants/RLS.

### Task 2: Shared admin gate
`isAdminEmail(email)` helper; wire AccountMenu `showAdmin`.

### Task 3: Admin analytics + export
Expand platform usage aggregates; CSV/PDF routes under `/api/admin/export/*` gated by ADMIN_EMAILS; no PII in payloads.

### Task 4: Protocol UI
Actions + home/exercises panel to start/end protocols.

### Task 5: Research consent
Actions + `/app/privacy` + post-onboarding skippable prompt on home.

### Task 6: Outcome trends
Deterministic 4/8-week adherence vs severity compute; call from Insights; show latest card.
