# Webcam Phase B (Face / Iris) — Design note

**Date:** 2026-07-28  
**Status:** Implemented

## Tracking coverage

| Mode | Exercises | Engine |
|---|---|---|
| `face_gaze_hold` | Thumb target, Wall target, visual habituation | Face Landmarker + iris |
| `face_near_far` | Near-far focus switch | Face Landmarker (face scale) |
| `pose_balance` | All balance exercises | Pose Landmarker |
| `pose_habituation` | Slow sit-to-stand | Pose Landmarker |
| _(none)_ | Canalith orientation / aftercare | Education only — no webcam |

## Flow

Gaze face modes: privacy → Start → **2s on-device calibration** → practice → End (metadata only).

## Explicit non-goals

- Canalith maneuver form coaching (clinically sensitive; content is orientation-only)
- Video upload / frame storage
