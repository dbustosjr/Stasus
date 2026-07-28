-- Enable Pose CV practice for selected balance exercises
UPDATE public.exercises
SET requires_cv_tracking = true
WHERE title IN ('Feet together stand', 'Weight shift side to side');

-- Soften outdated gaze safety copy that still says webcam arrives later
UPDATE public.exercises
SET instructions = jsonb_set(
  instructions,
  '{safety_notes}',
  (
    SELECT COALESCE(
      jsonb_agg(
        CASE
          WHEN elem LIKE '%Webcam form checks may arrive later%'
            THEN to_jsonb('Use Practice with camera for a head-movement check, or log manually.'::text)
          ELSE to_jsonb(elem)
        END
        ORDER BY ordinality
      ),
      '[]'::jsonb
    )
    FROM jsonb_array_elements_text(instructions->'safety_notes')
      WITH ORDINALITY AS t(elem, ordinality)
  )
)
WHERE requires_cv_tracking = true
  AND instructions ? 'safety_notes';
