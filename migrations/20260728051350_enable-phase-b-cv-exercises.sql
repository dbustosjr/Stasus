-- Phase B: enable on-device CV for all exercises this product can track.
-- Canalith remains education-only (no webcam form coaching).

UPDATE public.exercises
SET requires_cv_tracking = true
WHERE category IN (
  'gaze_stabilization',
  'balance_training',
  'habituation'
);

UPDATE public.exercises
SET requires_cv_tracking = false
WHERE category = 'canalith_repositioning';
