# Exercise library expansion (~35) — design

**Date:** 2026-07-30  
**Status:** Approved  
**Approach:** A — Content migration + light UI (no new tables / no program tracks)

## Goal

Grow the shared exercise library to ~35 clinically grounded wellness cards (gaze, habituation, balance, BPPV education), surface a **Suggested for you** strip from onboarding, and make webcam / phone setup expectations and evidence sources visible without clutter.

## Locked decisions

| Topic | Choice |
|-------|--------|
| Size | ~35 total |
| Mapping UI | Suggested strip first, full library by category below |
| BPPV / canalith | Expand education slightly; **no** DIY Epley/Semont steps |
| Existing 11 | Keep IDs; refine copy/tags; add around them |
| Device UX | Badge on cards + note on detail |
| Sources | Detail footer + shared About page |

## Architecture & content model

- **No new tables.** One migration: `UPDATE` existing rows + `INSERT` new ones → ~35.
- Extend `instructions` JSON (no column migration):
  - `device_preference`: `"webcam" | "phone_tablet" | "either" | "none"`
  - `device_note`: short setup string
- Normalize `condition_tags` to: `pppd`, `vestibular_migraine`, `menieres`, `bppv`, `undiagnosed` (plus keep honest secondary tags if useful).
- **CV / logging unchanged:** `requires_cv_tracking` + `PracticeCoach` where already appropriate; every practice card keeps manual log. Canalith: education only, `requires_cv_tracking = false`.
- Sources: `/app/exercises/about` + short footer on detail linking there.

## Library composition (~35)

| Category | ~Count | Focus |
|----------|-------:|--------|
| Gaze stabilization | 12 | VOR x1/x2 progressions, substitution, near–far, seated→standing, graded visual background |
| Habituation | 10 | Visual motion / busy scenes, paced head turns, sit–stand, graded exposure |
| Balance training | 8 | Stance narrowing, tandem, weight shift, head turns while standing, soft surface / gait **with support** |
| Canalith (education) | 5 | Existing orientation + aftercare; when to seek care; what repositioning is; safety / red flags |

Copy rules: wellness language, not a prescribed protocol; progressive `difficulty_level` + `sort_order`; never teach self-guided canalith maneuvers.

## Suggested strip + library UI

**`/app/exercises` layout**

1. Header + link to About this library  
2. **Suggested for you** (~6–8 cards)  
3. Full category sections (~35)

**Selection (server, deterministic)**

1. Start from `profiles.suggested_categories` (already set at onboarding).
2. Prefer those categories, lower `difficulty_level`, then `sort_order`.
3. Soft boost when `condition_label` fuzzy-matches a tag (e.g. “migraine” → `vestibular_migraine`) — never an exclusive filter.
4. Always include ≥1 gentle non-canalith card; only suggest canalith education if positional / BPPV-related pattern is present.
5. De-dupe; fill from suggested categories so undiagnosed users still get a strip.

Subtitle: based on onboarding — not a prescription. Home category chips can stay as-is this pass.

## Device badges & evidence

- Badge labels: “Webcam helpful” / “Phone or tablet” when preference is set; omit for `none`/absent.
- Detail: same badge + `device_note` above steps; does not gate PracticeCoach or manual log.
- Detail footer: brief “Based on vestibular rehab guidance (e.g. APTA/ANPT CPGs and related research)…” → About.
- About page: coverage, exclusions (no DIY canalith, not diagnosis), named source types, back link. No per-exercise footnotes.

## Safety, errors, verification

- Canalith clinician callouts remain; no maneuver step lists.
- Library load failure: existing alert pattern.
- Suggested empty: hide strip or one-line browse prompt — never invent rows.
- About is static (no DB dependency).
- Done when: migration applied, ~35 rows, existing 11 IDs preserved, Suggested works, badges + About + footer, manual log + CV still work on a flagged gaze card, typecheck/lint clean on touched files.

## Out of scope

- Schema columns for device/evidence, `exercise_condition_map`, named multi-week “programs”
- DIY Epley/Semont/self-CRT teaching
- Per-exercise footnotes
- Changing home beyond optional later polish
