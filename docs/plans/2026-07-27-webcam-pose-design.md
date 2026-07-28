# Webcam Pose Tracking (Phase A) — Design

**Date:** 2026-07-27  
**Status:** Approved  
**Follow-on:** Phase B — Face Landmarker / iris for gaze verification

## Goal

Let users practice selected exercises with on-device MediaPipe **Pose** tracking. Camera frames never leave the device; only practice metadata is saved.

## Scope

### In (Phase A)

- Shared `PracticeCoach` on exercise detail for `requires_cv_tracking` exercises
- `@mediapipe/tasks-vision` Pose Landmarker, client-side only
- Gaze exercises (interim): head yaw/pitch cycle counting — labeled as head-movement check, not eye tracking
- Balance exercises: upright/in-frame presence coaching
- Persist `duration_seconds`, `rep_count`, `cv_confidence_avg` on `exercise_sessions`
- Manual log remains available
- Confidence gating + clear “hard to see you” / permission-denied states
- Motion-safe UI (no aggressive overlays)

### Out (Phase A)

- Face Landmarker / iris / gaze-to-target calibration (Phase B)
- Canalith maneuver camera guidance
- Video/frame upload or InsForge Storage for camera data
- Auto-start camera on page load
- In-app PWA “install” prompts

## Architecture

```
Exercise detail (requires_cv_tracking)
  → PracticeCoach (client)
       → getUserMedia
       → PoseEngine (Pose Landmarker)
       → category checker (head yaw | balance presence)
       → TrackingStatus + timer / cues
  → End practice
       → logExerciseSession (metadata only)
       → exercise_sessions (RLS: own rows)
```

Privacy boundary: inference on-device; network only receives session metadata via the existing authenticated server action.

## UX

1. Privacy line before camera starts
2. Permission → model load → framing coach
3. States: tracking well / hard to see you / camera unavailable
4. Practice cues (gentle text); timer; optional rep count
5. End → save → return to detail
6. Fallback: existing manual LogSessionForm

## Data

Reuse `public.exercise_sessions`:

| Field | Use |
|---|---|
| `duration_seconds` | Wall time of practice |
| `rep_count` | Head yaw cycles when applicable; null for balance-only |
| `cv_confidence_avg` | Mean confidence across tracked frames (honest quality) |
| `notes` | Optional (manual form; coach may omit) |

Migration: set `requires_cv_tracking = true` on selected balance exercises (e.g. Feet together stand, Weight shift). Update gaze exercise copy that still says webcam arrives later.

Optional later: `cv_mode` column (`pose` \| `face`) — not required for Phase A if UI copy is honest.

## Confidence & errors

- Below-threshold frames: do not count reps; show “Hard to see you”
- Permission denied / no device / model failure: retry once where useful, then manual log
- Pause detect loop when tab hidden; stop tracks + dispose landmarker on unmount

## Testing

- Unit tests for head-yaw state machine and confidence gate (node script, same pattern as `test:red-flag`)
- Manual smoke: deny permission, leave frame, reduced-motion

## Phase B (documented hook only)

Same `PracticeCoach` shell; add Face Landmarker for gaze exercises; keep Pose for balance.
