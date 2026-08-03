-- Longitudinal Phase A: protocol events, research consent, outcome trends

CREATE TABLE IF NOT EXISTS public.protocol_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_category TEXT NOT NULL,
  protocol_label TEXT,
  adherence_target_per_week INTEGER CHECK (
    adherence_target_per_week IS NULL
    OR (adherence_target_per_week >= 1 AND adherence_target_per_week <= 21)
  ),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT protocol_events_category_check CHECK (
    exercise_category IN (
      'habituation',
      'gaze_stabilization',
      'balance_training',
      'canalith_repositioning'
    )
  ),
  CONSTRAINT protocol_events_ended_after_start CHECK (
    ended_at IS NULL OR ended_at >= started_at
  )
);

CREATE INDEX IF NOT EXISTS idx_protocol_events_user_active
  ON public.protocol_events (user_id, started_at DESC)
  WHERE ended_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_protocol_events_user_time
  ON public.protocol_events (user_id, started_at DESC);

ALTER TABLE public.protocol_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "protocol_events_select_own"
  ON public.protocol_events FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "protocol_events_insert_own"
  ON public.protocol_events FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "protocol_events_update_own"
  ON public.protocol_events FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "protocol_events_delete_own"
  ON public.protocol_events FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.protocol_events TO authenticated;
REVOKE ALL ON public.protocol_events FROM anon;

CREATE TABLE IF NOT EXISTS public.research_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_version TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'deidentified_aggregate_research',
  consented_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT research_consent_scope_check CHECK (
    scope IN ('deidentified_aggregate_research')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS research_consent_user_version_unique
  ON public.research_consent (user_id, consent_version);

CREATE INDEX IF NOT EXISTS idx_research_consent_user
  ON public.research_consent (user_id, created_at DESC);

ALTER TABLE public.research_consent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "research_consent_select_own"
  ON public.research_consent FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "research_consent_insert_own"
  ON public.research_consent FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "research_consent_update_own"
  ON public.research_consent FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE ON public.research_consent TO authenticated;
REVOKE DELETE ON public.research_consent FROM authenticated;
REVOKE ALL ON public.research_consent FROM anon;

CREATE TABLE IF NOT EXISTS public.outcome_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  window_start DATE NOT NULL,
  window_end DATE NOT NULL,
  window_weeks INTEGER NOT NULL CHECK (window_weeks IN (4, 8)),
  adherence_rate NUMERIC(4,3),
  severity_delta NUMERIC(5,2),
  significant BOOLEAN NOT NULL DEFAULT FALSE,
  model_used TEXT NOT NULL DEFAULT 'deterministic',
  summary_text TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT outcome_trends_window_check CHECK (window_end >= window_start)
);

CREATE UNIQUE INDEX IF NOT EXISTS outcome_trends_user_window_unique
  ON public.outcome_trends (user_id, window_weeks, window_end);

CREATE INDEX IF NOT EXISTS idx_outcome_trends_user_generated
  ON public.outcome_trends (user_id, generated_at DESC);

ALTER TABLE public.outcome_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "outcome_trends_select_own"
  ON public.outcome_trends FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Inserts/updates via service role only (same pattern as trusted insight writes)
GRANT SELECT ON public.outcome_trends TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.outcome_trends FROM authenticated;
REVOKE ALL ON public.outcome_trends FROM anon;
