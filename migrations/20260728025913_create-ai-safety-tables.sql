-- AI safety + insights tables (PRD §8)
-- red_flag_events: append-only audit; no client SELECT
-- ai_insights: user can read own rows; inserts via server/service path
-- ai_call_log: rate/audit for Anthropic calls

CREATE TABLE public.red_flag_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom_log_id UUID REFERENCES public.symptom_logs(id) ON DELETE SET NULL,
  flagged_pattern TEXT NOT NULL,
  flagged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  signals JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_red_flag_events_user_time
  ON public.red_flag_events (user_id, flagged_at DESC);

ALTER TABLE public.red_flag_events ENABLE ROW LEVEL SECURITY;

-- Authenticated users may INSERT their own audit row; no SELECT/UPDATE/DELETE for clients.
CREATE POLICY "red_flag_insert_own"
  ON public.red_flag_events
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

GRANT INSERT ON public.red_flag_events TO authenticated;
REVOKE SELECT, UPDATE, DELETE ON public.red_flag_events FROM authenticated;
REVOKE ALL ON public.red_flag_events FROM anon;

CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  insight_text TEXT NOT NULL,
  model_used TEXT NOT NULL,
  analysis_json JSONB,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, week_start)
);

CREATE INDEX idx_ai_insights_user_week
  ON public.ai_insights (user_id, week_start DESC);

ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_insights_select_own"
  ON public.ai_insights
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Inserts/updates happen from trusted server path with user session after generation.
CREATE POLICY "ai_insights_insert_own"
  ON public.ai_insights
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "ai_insights_update_own"
  ON public.ai_insights
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE ON public.ai_insights TO authenticated;
REVOKE DELETE ON public.ai_insights FROM authenticated;
REVOKE ALL ON public.ai_insights FROM anon;

CREATE TABLE public.ai_call_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  model_used TEXT,
  called_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_call_log_user_time
  ON public.ai_call_log (user_id, called_at DESC);

ALTER TABLE public.ai_call_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_call_log_insert_own"
  ON public.ai_call_log
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "ai_call_log_select_own"
  ON public.ai_call_log
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT ON public.ai_call_log TO authenticated;
REVOKE UPDATE, DELETE ON public.ai_call_log FROM authenticated;
REVOKE ALL ON public.ai_call_log FROM anon;
