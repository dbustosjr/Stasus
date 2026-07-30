-- Harden AI tables + input length checks.
-- Clients may SELECT own ai_insights / ai_call_log only.
-- INSERT/UPDATE go through server admin client or edge functions.

DROP POLICY IF EXISTS "ai_insights_insert_own" ON public.ai_insights;
DROP POLICY IF EXISTS "ai_insights_update_own" ON public.ai_insights;
REVOKE INSERT, UPDATE ON public.ai_insights FROM authenticated;
-- SELECT policy + GRANT SELECT remain from create migration

DROP POLICY IF EXISTS "ai_call_log_insert_own" ON public.ai_call_log;
REVOKE INSERT ON public.ai_call_log FROM authenticated;
-- SELECT remains for per-user rate-limit checks

-- Symptom log duration + notes bounds (server already enforces)
ALTER TABLE public.symptom_logs
  DROP CONSTRAINT IF EXISTS symptom_logs_duration_minutes_check;

ALTER TABLE public.symptom_logs
  ADD CONSTRAINT symptom_logs_duration_minutes_check
  CHECK (
    duration_minutes IS NULL
    OR (duration_minutes >= 0 AND duration_minutes <= 1440)
  );

ALTER TABLE public.symptom_logs
  DROP CONSTRAINT IF EXISTS symptom_logs_notes_length_check;

ALTER TABLE public.symptom_logs
  ADD CONSTRAINT symptom_logs_notes_length_check
  CHECK (notes IS NULL OR char_length(notes) <= 2000);

ALTER TABLE public.custom_triggers
  DROP CONSTRAINT IF EXISTS custom_triggers_label_length_check;

ALTER TABLE public.custom_triggers
  ADD CONSTRAINT custom_triggers_label_length_check
  CHECK (char_length(label) <= 80);

ALTER TABLE public.exercise_sessions
  DROP CONSTRAINT IF EXISTS exercise_sessions_notes_length_check;

ALTER TABLE public.exercise_sessions
  ADD CONSTRAINT exercise_sessions_notes_length_check
  CHECK (notes IS NULL OR char_length(notes) <= 500);

ALTER TABLE public.exercise_sessions
  DROP CONSTRAINT IF EXISTS exercise_sessions_duration_seconds_check;

ALTER TABLE public.exercise_sessions
  ADD CONSTRAINT exercise_sessions_duration_seconds_check
  CHECK (
    duration_seconds IS NULL
    OR (duration_seconds >= 0 AND duration_seconds <= 10800)
  );
