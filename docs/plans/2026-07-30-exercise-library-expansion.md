# Exercise Library Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand the shared exercise library to ~35 evidence-aligned wellness cards, add a Suggested-for-you strip from onboarding, device-preference badges/notes, and an About + detail evidence footer — without new tables or DIY canalith maneuvers.

**Architecture:** Keep `public.exercises` as the single source. One InsForge SQL migration UPDATEs the existing 11 (preserve IDs) and INSERTs ~24 new rows. Extend `ExerciseInstructions` with optional `device_preference` / `device_note`. Pure helpers rank Suggested cards from `profiles.suggested_categories`, `symptom_patterns`, and `condition_label`. Library/detail UI consume the new fields; static About page holds shared citations.

**Tech Stack:** Next.js App Router, InsForge Postgres + RLS (authenticated read), existing `PracticeCoach` / `LogSessionForm`, `@insforge` CLI for migrate apply.

**Design doc:** `docs/plans/2026-07-30-exercise-library-expansion-design.md`

**Skills:** @insforge-cli for migration apply; @insforge only if SDK patterns change (they should not).

---

### Task 1: Extend exercise instruction types + device badge helpers

**Files:**
- Modify: `src/lib/exercises/types.ts`
- Create: `src/lib/exercises/device.ts`
- Create: `scripts/test-exercise-device.mjs`
- Modify: `package.json` (add `test:exercise-device` if other `test:*` scripts exist; else document run via `node`)

**Step 1: Write failing test**

```js
#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  deviceBadgeLabel,
  parseDevicePreference,
} from "../src/lib/exercises/device.ts";

assert.equal(parseDevicePreference(undefined), null);
assert.equal(parseDevicePreference("webcam"), "webcam");
assert.equal(parseDevicePreference("nope"), null);
assert.equal(deviceBadgeLabel("webcam"), "Webcam helpful");
assert.equal(deviceBadgeLabel("phone_tablet"), "Phone or tablet");
assert.equal(deviceBadgeLabel("either"), "Webcam or phone");
assert.equal(deviceBadgeLabel("none"), null);
console.log("exercise-device: ok");
```

**Step 2: Run — expect FAIL (module missing)**

Run: `node --experimental-strip-types scripts/test-exercise-device.mjs`

**Step 3: Implement**

In `types.ts`, extend:

```ts
export type DevicePreference = "webcam" | "phone_tablet" | "either" | "none";

export type ExerciseInstructions = {
  steps: string[];
  duration_hint?: string;
  safety_notes?: string[];
  device_preference?: DevicePreference;
  device_note?: string;
};
```

In `device.ts`: `parseDevicePreference`, `deviceBadgeLabel` as above.

**Step 4: Re-run test — expect PASS**

**Step 5: Commit**

```bash
git add src/lib/exercises/types.ts src/lib/exercises/device.ts scripts/test-exercise-device.mjs package.json
git commit -m "$(cat <<'EOF'
feat(exercises): add device preference types and badge helpers

EOF
)"
```

---

### Task 2: Suggested ranking helpers + test

**Files:**
- Create: `src/lib/exercises/suggest.ts`
- Create: `scripts/test-exercise-suggest.mjs`

**Step 1: Write failing test**

Cover:

- Prefer `suggested_categories`, then lower `difficulty_level`, then `sort_order`
- Soft boost when `condition_label` matches tag (`"vestibular migraine"` → `vestibular_migraine`)
- Canalith only included when `symptom_patterns` includes `positional_spinning`
- Cap at 8; de-dupe by id
- Empty categories → still return gentle habituation/balance from full list if those are in suggested (or default fill)

Minimal fixture: 6 fake exercises across categories.

**Step 2: Run — expect FAIL**

**Step 3: Implement `pickSuggestedExercises`**

```ts
export type SuggestInput = {
  exercises: Array<{
    id: string;
    category: ExerciseCategory;
    condition_tags: string[] | null;
    difficulty_level: number | null;
    sort_order: number;
  }>;
  suggestedCategories: ExerciseCategory[];
  symptomPatterns: string[];
  conditionLabel: string | null;
  limit?: number; // default 8
};

export function pickSuggestedExercises(input: SuggestInput): typeof input.exercises;
```

Also export `tagsFromConditionLabel(label: string | null): string[]` for the soft boost.

**Step 4: Re-run — expect PASS**

**Step 5: Commit**

```bash
git add src/lib/exercises/suggest.ts scripts/test-exercise-suggest.mjs
git commit -m "$(cat <<'EOF'
feat(exercises): add Suggested-for-you ranking helpers

EOF
)"
```

---

### Task 3: Shared exercise card chrome (badge)

**Files:**
- Create: `src/components/exercise-card-link.tsx` (or small presentational bits in existing page — prefer one shared component)
- Modify: `src/app/app/exercises/page.tsx` (will wire fully in Task 5; here extract card if helpful)

**Step 1:** Add `ExerciseCardLink` that renders title, description clamp, category badge, difficulty, optional device badge from `instructions`.

**Step 2:** No separate unit test required if Task 1 covers label logic; visual check in Task 5.

**Step 3: Commit**

```bash
git add src/components/exercise-card-link.tsx
git commit -m "$(cat <<'EOF'
feat(exercises): shared library card with device badge

EOF
)"
```

---

### Task 4: SQL migration — refine 11 + insert ~24

**Files:**
- Create: `migrations/YYYYMMDDHHMMSS_expand-exercise-library.sql` (timestamp via InsForge CLI or local clock)

**Constraints:**
- **UPDATE by `title`** (stable) for the original 11 — do **not** delete/reinsert (preserve UUIDs / session FKs)
- INSERT new titles only
- End state: `SELECT count(*) FROM exercises` ≈ 35
- Canalith new cards: education only; **no** Epley/Semont positional step sequences
- Set `device_preference` / `device_note` in instructions JSON where relevant
- Normalize tags toward `pppd`, `vestibular_migraine`, `menieres`, `bppv`, `undiagnosed`
- Gaze VOR-style and many balance/habituation practice cards: `requires_cv_tracking` consistent with Phase B (`true` for practice that already has a CV mode; `false` for education / near-far may stay false or true per existing near-far behavior)

**Target inventory (titles — adjust wording slightly for clarity, keep intent):**

*Keep / UPDATE (11):*
1. Seated visual scan  
2. Pattern glance (low intensity)  
3. Slow sit-to-stand with pause  
4. Thumb target (seated)  
5. Wall target horizontal  
6. Near-far focus switch  
7. Feet together stand  
8. Tandem stand (supported)  
9. Weight shift side to side  
10. Orientation: canalith maneuvers  
11. Aftercare mindset (post-maneuver)

*Gaze INSERT (~9):*
- Wall target vertical  
- Thumb target standing  
- VOR x1 horizontal (small range)  
- VOR x2 seated (target opposite head) — wellness wording, stop rules  
- Eyes-then-head (two-target substitution)  
- Remembered target (imaginary target)  
- Thumb target with mild busy background  
- Seated corner-to-corner gaze  
- Standing wall target with support nearby  

*Habituation INSERT (~7):*
- Slow seated head turns  
- Standing visual scan (supported)  
- Graded busy-pattern glance  
- Walking visual scan (hallway, support)  
- Slow turn-in-place (supported)  
- Sit-to-stand with head turn (gentle)  
- Optic flow glance (passing scenery / window) — keep intensity low  

*Balance INSERT (~5):*
- Narrow stance stand (supported)  
- Single-leg stand (fingertip support)  
- Standing head turns (supported)  
- March in place (supported)  
- Soft-surface stand (mat, support) — skip if no safe setup  

*Canalith education INSERT (~3):*
- When to seek care for positional spinning  
- What canalith repositioning is  
- Safety after positional symptoms  

**Step 1:** Author migration SQL with UPDATE … WHERE title = … for each of 11, then INSERT block.

**Step 2:** Apply with InsForge CLI per @insforge-cli (`db query` / migrate apply as this repo usually does).

**Step 3:** Verify counts and that old session `exercise_id`s still resolve.

**Step 4: Commit migration file only after apply succeeds (or commit file then apply — match repo habit).**

```bash
git add migrations/*expand-exercise-library.sql
git commit -m "$(cat <<'EOF'
feat(exercises): expand library to ~35 evidence-aligned cards

EOF
)"
```

---

### Task 5: Library page — Suggested strip + About link + badges

**Files:**
- Modify: `src/app/app/exercises/page.tsx`
- Modify: `src/lib/auth/require-onboarded.ts` only if more profile fields needed (already has patterns + suggested_categories + condition_label)

**Step 1:** After fetch, call `pickSuggestedExercises({ exercises, suggestedCategories: profile.suggested_categories, symptomPatterns: profile.symptom_patterns, conditionLabel: profile.condition_label })`.

**Step 2:** Render Suggested section above categories when length > 0; else omit or show muted “Browse categories below”.

**Step 3:** Use shared card component; link header to `/app/exercises/about`.

**Step 4:** Manual check in browser signed-in.

**Step 5: Commit**

```bash
git add src/app/app/exercises/page.tsx src/components/exercise-card-link.tsx
git commit -m "$(cat <<'EOF'
feat(exercises): Suggested-for-you strip on library page

EOF
)"
```

---

### Task 6: Detail page — device note, evidence footer

**Files:**
- Modify: `src/app/app/exercises/[id]/page.tsx`

**Step 1:** Show device badge + `device_note` when present.

**Step 2:** Footer paragraph + link to About (all exercises).

**Step 3:** Confirm PracticeCoach + LogSessionForm still render for CV-flagged gaze.

**Step 4: Commit**

```bash
git add src/app/app/exercises/[id]/page.tsx
git commit -m "$(cat <<'EOF'
feat(exercises): device note and evidence footer on detail

EOF
)"
```

---

### Task 7: About this library page

**Files:**
- Create: `src/app/app/exercises/about/page.tsx`

**Content (concise):**
- What Stasus exercises are (wellness practice cards)
- Categories covered
- What we do **not** include (DIY canalith maneuvers, diagnosis, personalized medical plans)
- Evidence framing: APTA/ANPT vestibular hypofunction CPG themes (VOR x1/x2, substitution, habituation, balance/gait); PPPD VRT literature supporting customized gaze + balance + visual desensitization; Cawthorne–Cooksey as historical/supportive, not uniquely superior
- Link back to `/app/exercises`
- Not medical advice disclaimer

**Step 1:** Implement static page inside `AppShell`.

**Step 2:** Verify route does not collide with `[id]` — `about` is a static segment and must win (Next.js App Router: sibling `about/page.tsx` is fine beside `[id]`).

**Step 3: Commit**

```bash
git add src/app/app/exercises/about/page.tsx
git commit -m "$(cat <<'EOF'
feat(exercises): add About this library evidence page

EOF
)"
```

---

### Task 8: CV title routing smoke + copy pass

**Files:**
- Modify: `src/lib/cv/track-mode.ts` only if new titles need explicit matchers (e.g. near-far variants)
- Create or extend: `scripts/test-cv-track-mode.mjs` if one exists; else quick asserts for new titles

**Step 1:** Ensure new gaze titles resolve to `face_gaze_hold` (or near-far when appropriate); sit-to-stand habituation → `pose_habituation`; canalith → `null`.

**Step 2:** Spot-fix one webcam session + one manual log.

**Step 3: Commit if code changed**

---

### Task 9: Verification checklist

**Run:**
- `node --experimental-strip-types scripts/test-exercise-device.mjs`
- `node --experimental-strip-types scripts/test-exercise-suggest.mjs`
- `npx tsc --noEmit` (or project’s usual typecheck)
- Confirm DB count ~35; open `/app/exercises`, `/app/exercises/about`, one detail URL
- Confirm Suggested for a user with `positional_spinning` can include canalith education; without it, does not

**Do not claim done until checklist passes.**

---

## Out of scope (do not implement)

- New DB columns / program tracks / filter chips
- DIY Epley/Semont content
- Per-exercise footnotes
- Home page redesign beyond existing category chips
