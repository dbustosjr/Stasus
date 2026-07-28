-- Exercise practice sessions (metadata only — no video)
CREATE TABLE public.exercise_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_seconds INTEGER CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  rep_count INTEGER CHECK (rep_count IS NULL OR rep_count >= 0),
  cv_confidence_avg NUMERIC(4,3),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercise_sessions_user_time
  ON public.exercise_sessions (user_id, completed_at DESC);

CREATE INDEX idx_exercise_sessions_exercise
  ON public.exercise_sessions (exercise_id, completed_at DESC);

ALTER TABLE public.exercise_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exercise_sessions_select_own"
  ON public.exercise_sessions FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "exercise_sessions_insert_own"
  ON public.exercise_sessions FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "exercise_sessions_update_own"
  ON public.exercise_sessions FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "exercise_sessions_delete_own"
  ON public.exercise_sessions FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercise_sessions TO authenticated;
REVOKE ALL ON public.exercise_sessions FROM anon;

-- Onboarding personalization fields on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS symptom_patterns JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS suggested_categories JSONB NOT NULL DEFAULT '[]'::jsonb;
