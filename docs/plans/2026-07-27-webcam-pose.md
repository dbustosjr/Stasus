# Webcam Pose Practice Coach (Phase A) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship on-device MediaPipe Pose practice coaching on CV-flagged exercises, saving only session metadata.

**Architecture:** Client `PracticeCoach` owns camera + Pose Landmarker; pure checker modules turn landmarks into reps/status; existing `logExerciseSession` action persists metadata under RLS. No frames leave the browser.

**Tech Stack:** Next.js App Router, React 19, TypeScript, `@mediapipe/tasks-vision`, InsForge `exercise_sessions`, node script tests (same style as `scripts/test-red-flag.mjs`)

**Design:** @docs/plans/2026-07-27-webcam-pose-design.md

---

### Task 1: Head-yaw checker — failing tests

**Files:**
- Create: `src/lib/cv/pose/head-yaw.ts`
- Create: `scripts/test-head-yaw.mjs`
- Modify: `package.json` (add `test:head-yaw` script)

**Step 1: Write the test script first (will fail until module exists)**

Create `scripts/test-head-yaw.mjs`:

```js
import assert from "node:assert/strict";
import { createHeadYawTracker } from "../src/lib/cv/pose/head-yaw.ts";

const t = createHeadYawTracker({
  enterThreshold: 0.12,
  returnThreshold: 0.04,
  minConfidence: 0.6,
});

assert.equal(t.reps, 0);
t.update({ yaw: -0.2, confidence: 0.9 }); // left
t.update({ yaw: 0.2, confidence: 0.9 }); // right → 1 cycle
assert.equal(t.reps, 1);

t.update({ yaw: -0.2, confidence: 0.2 }); // low conf ignored
t.update({ yaw: 0.2, confidence: 0.2 });
assert.equal(t.reps, 1, "low confidence must not count");

console.log("test-head-yaw: ok");
```

**Step 2: Add npm script**

In `package.json` scripts:

```json
"test:head-yaw": "node --experimental-strip-types scripts/test-head-yaw.mjs"
```

(If strip-types fails on this Node version, compile the pure module as `.mjs` twin under `scripts/` instead — prefer importing TS via strip-types when available.)

**Step 3: Run test — expect FAIL**

Run: `npm run test:head-yaw`  
Expected: module not found / export missing

**Step 4: Commit tests + script wiring only if preferred; otherwise continue to Task 2 before commit**

---

### Task 2: Head-yaw checker — implement

**Files:**
- Create: `src/lib/cv/pose/head-yaw.ts`

**Step 1: Implement minimal tracker**

```ts
export type HeadYawSample = { yaw: number; confidence: number };

export type HeadYawOptions = {
  enterThreshold: number;
  returnThreshold: number;
  minConfidence: number;
};

type Side = "center" | "left" | "right";

export function createHeadYawTracker(opts: HeadYawOptions) {
  let reps = 0;
  let lastExtreme: Side = "center";
  let visited: Side = "center";

  return {
    get reps() {
      return reps;
    },
    update(sample: HeadYawSample) {
      if (sample.confidence < opts.minConfidence) return;
      let side: Side = "center";
      if (sample.yaw <= -opts.enterThreshold) side = "left";
      else if (sample.yaw >= opts.enterThreshold) side = "right";
      else if (Math.abs(sample.yaw) <= opts.returnThreshold) side = "center";
      else return;

      if (side === "left" || side === "right") {
        if (visited !== "center" && visited !== side && lastExtreme !== side) {
          reps += 1;
          lastExtreme = side;
          visited = side;
        } else if (visited === "center") {
          visited = side;
          lastExtreme = side;
        } else {
          visited = side;
        }
      }
    },
    reset() {
      reps = 0;
      lastExtreme = "center";
      visited = "center";
    },
  };
}

/** Approximate yaw from nose vs shoulders (MediaPipe normalized coords). */
export function yawFromPoseLandmarks(lm: {
  nose: { x: number; visibility?: number };
  leftShoulder: { x: number; visibility?: number };
  rightShoulder: { x: number; visibility?: number };
}): HeadYawSample {
  const midX = (lm.leftShoulder.x + lm.rightShoulder.x) / 2;
  const yaw = lm.nose.x - midX; // mirrored webcam: sign handled in UI cues
  const confidence = Math.min(
    lm.nose.visibility ?? 1,
    lm.leftShoulder.visibility ?? 1,
    lm.rightShoulder.visibility ?? 1,
  );
  return { yaw, confidence };
}
```

Tune the left↔right cycle logic until `npm run test:head-yaw` passes (adjust state machine if the first draft is too strict/loose; tests are the contract).

**Step 2: Run tests**

Run: `npm run test:head-yaw`  
Expected: `test-head-yaw: ok`

**Step 3: Commit**

```bash
git add src/lib/cv/pose/head-yaw.ts scripts/test-head-yaw.mjs package.json
git commit -m "$(cat <<'EOF'
Add head-yaw pose checker with unit smoke test.

EOF
)"
```

---

### Task 3: Balance presence helper + test

**Files:**
- Create: `src/lib/cv/pose/balance-presence.ts`
- Create: `scripts/test-balance-presence.mjs`
- Modify: `package.json` (`test:balance-presence`, optional `test:cv` aggregating both)

**Behavior:**
- Input: shoulder + hip landmarks with visibility
- Output: `{ ok: boolean; confidence: number; reason?: 'low_confidence' | 'out_of_frame' | 'ok' }`
- `ok` when min visibility ≥ 0.6 and torso center roughly in frame (x in [0.2, 0.8], y in [0.15, 0.85])

**Steps:** failing test → implement → pass → commit  
Message: `Add balance presence checker for pose coaching.`

---

### Task 4: Install MediaPipe tasks-vision

**Files:**
- Modify: `package.json` / lockfile

**Step 1:**

```bash
npm install @mediapipe/tasks-vision
```

**Step 2:** Confirm WASM/model loading strategy — prefer CDN Google storage URLs used in MediaPipe docs for `FileSetResolver.forVisionTasks` + `PoseLandmarker` model (`pose_landmarker_lite.task`) so we do not vendor huge binaries in-repo. Document URLs in `src/lib/cv/pose/engine.ts` constants.

**Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
Add MediaPipe tasks-vision dependency for on-device pose.

EOF
)"
```

---

### Task 5: PoseEngine module

**Files:**
- Create: `src/lib/cv/pose/engine.ts`
- Create: `src/lib/cv/pose/landmarks.ts` (index constants: nose=0, L/R shoulder=11/12, L/R hip=23/24)

**API sketch:**

```ts
export type PoseEngine = {
  detect(video: HTMLVideoElement, timestampMs: number): {
    landmarks: Array<{ x: number; y: number; z: number; visibility?: number }>;
    confidence: number;
  } | null;
  close(): void;
};

export async function createPoseEngine(): Promise<PoseEngine>;
```

- Lazy-load only from client code
- `runningMode: "VIDEO"`
- `close()` must free WASM resources

No browser test required in CI; typecheck via `npm run build` later.

**Commit:** `Add PoseEngine wrapper around MediaPipe Pose Landmarker.`

---

### Task 6: Extend session logging action

**Files:**
- Modify: `src/app/actions/sessions.ts`
- Create: `scripts/test-session-cv-fields.mjs` (optional pure parse helper) **or** inline validation in action only

**Step 1:** Accept optional FormData fields:

- `rep_count` — integer ≥ 0 or empty
- `cv_confidence_avg` — number in [0, 1] or empty

**Step 2:** Insert into `exercise_sessions` alongside existing fields.

**Step 3:** Keep manual form working (fields omitted → null).

**Commit:** `Persist CV rep count and confidence on exercise sessions.`

---

### Task 7: Camera + PracticeCoach UI

**Files:**
- Create: `src/components/cv/camera-viewport.tsx`
- Create: `src/components/cv/tracking-status.tsx`
- Create: `src/components/cv/practice-coach.tsx`
- Modify: `src/app/app/exercises/[id]/page.tsx`

**PracticeCoach behavior:**
1. Collapsed CTA: “Practice with camera”
2. Expand → privacy copy → Start
3. Request `getUserMedia({ video: { facingMode: 'user' }, audio: false })`
4. `createPoseEngine()` once
5. `requestAnimationFrame` loop: detect → yawFromPose / balance checker → update status + reps
6. Pause when `document.visibilityState !== 'visible'`
7. End → hidden form or direct `logExerciseSession` call via form action with duration/reps/confidence
8. Cleanup on unmount: `stream.getTracks().forEach(t => t.stop())`, `engine.close()`

**Copy rules:**
- Gaze category: “Head movement check (pose). Eye tracking comes later.”
- Balance: “Pose check — stay centered in frame with support nearby.”
- Never claim diagnosis or perfect form scoring

**Motion-safety:** text status only; optional very faint static silhouette guide; no bouncing landmark particles. Honor `prefers-reduced-motion` (disable any nonessential CSS transitions).

**Wire page:** if `requires_cv_tracking`, render `<PracticeCoach exerciseId={...} category={...} />` above `LogSessionForm`; remove “Webcam check planned later”.

**Commit:** `Add PracticeCoach UI for on-device pose practice.`

---

### Task 8: Enable balance CV flags + copy migration

**Files:**
- Create: `migrations/<timestamp>_enable-pose-cv-exercises.sql`

SQL:

```sql
UPDATE public.exercises
SET requires_cv_tracking = true
WHERE title IN ('Feet together stand', 'Weight shift side to side');

-- Soften outdated gaze safety copy if still present
UPDATE public.exercises
SET instructions = jsonb_set(
  instructions,
  '{safety_notes}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN value::text LIKE '%Webcam form checks may arrive later%'
          THEN '"Use Practice with camera for a head-movement check, or log manually."'
        ELSE value
      END
    )
    FROM jsonb_array_elements_text(instructions->'safety_notes') AS value
  )
)
WHERE requires_cv_tracking = true
  AND instructions ? 'safety_notes';
```

Apply via InsForge CLI per project convention (`npx @insforge/cli` / existing migration apply flow in AGENTS.md).

**Commit:** `Enable pose CV on selected balance exercises.`

---

### Task 9: Verify build + smoke checklist

**Step 1:**

```bash
npm run test:head-yaw
npm run test:balance-presence
npm run build
```

Expected: all pass / build success.

**Step 2: Manual checklist**

- [ ] Deny camera → clear error + manual log still works
- [ ] Allow camera → tracking well when framed
- [ ] Leave frame → “Hard to see you”; reps do not increase
- [ ] End practice → session row shows duration / reps / confidence
- [ ] Navigate away → camera LED off
- [ ] Reduced-motion OS setting → no aggressive motion

**Step 3: Memory**

```bash
npx @insforge/cli memory remember "Phase A webcam: Pose only via PracticeCoach; metadata-only sessions; gaze uses head-yaw interim; Face/iris is Phase B."
```

**Commit** any fixups: `Polish pose practice coach after build verification.`

---

## Phase B (not in this plan)

- Face Landmarker + iris landmarks
- On-device gaze calibration
- Swap gaze checkers from head-yaw to gaze-follow scoring
- Keep Pose for balance

---

## Execution handoff

Plan complete and saved to `docs/plans/2026-07-27-webcam-pose.md`.
