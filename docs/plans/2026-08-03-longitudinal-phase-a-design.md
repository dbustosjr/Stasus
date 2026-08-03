# Longitudinal Phase A Design

Approved 2026-08-03. Companion to Stasus PRD v2 Longitudinal Addendum Stage 1.

## Goal

Ship usable longitudinal instrumentation before closed beta: protocol events, research consent, per-user outcome trends, and founder admin analytics — without a care-team portal.

## Decisions

- Usable UI now (not schema-only).
- Admin analytics/export is **de-identified**: counts and distributions only; no emails, names, user IDs, free-text notes, or condition labels in the admin report.
- Research consent: skippable post-onboarding prompt + Account → Privacy management; opt-in only.
- Build order: Phase A (foundation) complete, then Phase B (camera dual-mode, calm practice UI, trust copy).
- Care-team portal and partner de-identified row exports deferred.

## Phase A scope

1. Personal Admin menu item (ADMIN_EMAILS only) → `/app/admin/usage`
2. Richer admin usage analytics + de-identified CSV/PDF download
3. `protocol_events` + start/end protocol UI
4. `research_consent` + onboarding prompt + `/app/privacy`
5. `outcome_trends` + monthly per-user compute + Insights surface

## Out of scope (Phase B+)

Camera form opt-in gate, calm guided practices beyond breathing, landing trust copy rewrite, aggregate cohort ETL, partner exports, care-team portal.
