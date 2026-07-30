-- Soft-archive for symptom logs (saved vs archived lists on tracker).

ALTER TABLE public.symptom_logs
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_archived_time
  ON public.symptom_logs (user_id, archived_at, logged_at DESC);
