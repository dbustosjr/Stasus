-- Symptom & trigger tracker (PRD §6.3)
-- user_id references auth.users (not a custom users table)

CREATE TABLE public.custom_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT custom_triggers_label_not_blank CHECK (char_length(trim(label)) > 0)
);

CREATE UNIQUE INDEX idx_custom_triggers_user_label_lower
  ON public.custom_triggers (user_id, lower(trim(label)));

CREATE INDEX idx_custom_triggers_user
  ON public.custom_triggers (user_id, created_at DESC);

ALTER TABLE public.custom_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "custom_triggers_select_own"
  ON public.custom_triggers FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "custom_triggers_insert_own"
  ON public.custom_triggers FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "custom_triggers_update_own"
  ON public.custom_triggers FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "custom_triggers_delete_own"
  ON public.custom_triggers FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_triggers TO authenticated;
REVOKE ALL ON public.custom_triggers FROM anon;

CREATE TABLE public.symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 10),
  duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
  triggers JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_symptom_logs_user_time
  ON public.symptom_logs (user_id, logged_at DESC);

ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "symptom_logs_select_own"
  ON public.symptom_logs FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "symptom_logs_insert_own"
  ON public.symptom_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "symptom_logs_update_own"
  ON public.symptom_logs FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "symptom_logs_delete_own"
  ON public.symptom_logs FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.symptom_logs TO authenticated;
REVOKE ALL ON public.symptom_logs FROM anon;
