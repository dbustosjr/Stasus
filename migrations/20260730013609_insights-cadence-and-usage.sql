-- Insights cadence + local-timezone usage metrics
-- profiles.timezone, user_activity_days, ai_insights cadence columns

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'UTC';

CREATE TABLE IF NOT EXISTS public.user_activity_days (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  sources JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, activity_date)
);

ALTER TABLE public.user_activity_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_activity_days_select_own" ON public.user_activity_days;
CREATE POLICY "user_activity_days_select_own"
  ON public.user_activity_days FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "user_activity_days_upsert_own" ON public.user_activity_days;
CREATE POLICY "user_activity_days_upsert_own"
  ON public.user_activity_days FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "user_activity_days_update_own" ON public.user_activity_days;
CREATE POLICY "user_activity_days_update_own"
  ON public.user_activity_days FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE ON public.user_activity_days TO authenticated;
REVOKE DELETE ON public.user_activity_days FROM authenticated;
REVOKE ALL ON public.user_activity_days FROM anon;

ALTER TABLE public.ai_insights
  ADD COLUMN IF NOT EXISTS cadence TEXT NOT NULL DEFAULT 'weekly',
  ADD COLUMN IF NOT EXISTS period_start DATE,
  ADD COLUMN IF NOT EXISTS source_log_id UUID REFERENCES public.symptom_logs(id) ON DELETE SET NULL;

UPDATE public.ai_insights
SET period_start = week_start
WHERE period_start IS NULL;

ALTER TABLE public.ai_insights
  ALTER COLUMN period_start SET NOT NULL;

ALTER TABLE public.ai_insights
  DROP CONSTRAINT IF EXISTS ai_insights_user_id_week_start_key;

CREATE UNIQUE INDEX IF NOT EXISTS ai_insights_weekly_unique
  ON public.ai_insights (user_id, period_start)
  WHERE cadence = 'weekly';

CREATE UNIQUE INDEX IF NOT EXISTS ai_insights_monthly_unique
  ON public.ai_insights (user_id, period_start)
  WHERE cadence = 'monthly';

CREATE UNIQUE INDEX IF NOT EXISTS ai_insights_daily_log_unique
  ON public.ai_insights (source_log_id)
  WHERE source_log_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ai_insights_user_cadence_period
  ON public.ai_insights (user_id, cadence, period_start DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ai_insights_cadence_check'
  ) THEN
    ALTER TABLE public.ai_insights
      ADD CONSTRAINT ai_insights_cadence_check
      CHECK (cadence IN ('daily', 'weekly', 'monthly'));
  END IF;
END $$;
