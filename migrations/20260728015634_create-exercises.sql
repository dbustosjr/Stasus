-- Shared exercise library (reference content). Authenticated read; admin-only writes.
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN (
    'habituation',
    'gaze_stabilization',
    'balance_training',
    'canalith_repositioning'
  )),
  condition_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  title TEXT NOT NULL,
  description TEXT,
  instructions JSONB NOT NULL DEFAULT '{}'::jsonb,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  requires_cv_tracking BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercises_category_sort
  ON public.exercises (category, sort_order, title);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exercises_read_authenticated"
  ON public.exercises
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- No INSERT/UPDATE/DELETE policies for anon/authenticated — seed & admin via project_admin only.

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.exercises TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.exercises FROM anon, authenticated;

-- Seed: wellness-safe practice content (not medical advice / not diagnosis)
INSERT INTO public.exercises
  (category, condition_tags, title, description, instructions, difficulty_level, requires_cv_tracking, sort_order)
VALUES
(
  'habituation',
  '["PPPD","motion_sensitivity"]'::jsonb,
  'Seated visual scan',
  'A calm starting practice: slowly look across a quiet room while seated, noticing symptoms without pushing through distress.',
  '{
    "steps": [
      "Sit supported with both feet on the floor.",
      "Choose three quiet visual points left, center, and right.",
      "Look to each point for a few seconds, then return to center.",
      "Stop if symptoms rise sharply; rest and retry later at a gentler pace."
    ],
    "duration_hint": "3–5 minutes",
    "safety_notes": [
      "This is general wellness practice, not a diagnosis or treatment plan.",
      "Stop if you feel unsafe or symptoms become severe."
    ]
  }'::jsonb,
  1,
  false,
  10
),
(
  'habituation',
  '["PPPD","visual_sensitivity"]'::jsonb,
  'Pattern glance (low intensity)',
  'Brief, paced glances at a mildly busy pattern (like a striped cloth) to practice staying oriented.',
  '{
    "steps": [
      "Place a mildly patterned item a comfortable distance away.",
      "Look at a plain wall, then glance at the pattern for 1–2 seconds.",
      "Return to the plain wall and breathe slowly.",
      "Repeat a few cycles; keep intensity low enough that you can finish calmly."
    ],
    "duration_hint": "2–4 minutes",
    "safety_notes": [
      "Avoid aggressive or flashing visuals.",
      "Increase exposure only when the current level feels manageable."
    ]
  }'::jsonb,
  2,
  false,
  20
),
(
  'habituation',
  '["PPPD","motion_sensitivity"]'::jsonb,
  'Slow sit-to-stand with pause',
  'Practice changing position with deliberate pauses so your system can settle between movements.',
  '{
    "steps": [
      "Sit near a stable surface you can touch if needed.",
      "Stand up slowly, pause for two breaths at the top.",
      "Sit back down slowly, pause again.",
      "Repeat a few times, prioritizing steadiness over speed."
    ],
    "duration_hint": "3–5 minutes",
    "safety_notes": [
      "Use support if you feel unsteady.",
      "Skip if you have acute injury or feel unsafe standing."
    ]
  }'::jsonb,
  2,
  false,
  30
),
(
  'gaze_stabilization',
  '["gaze_instability","post_acute"]'::jsonb,
  'Thumb target (seated)',
  'Keep a nearby target clear while your head turns gently — a foundational gaze practice.',
  '{
    "steps": [
      "Hold your thumb at arm''s length as a clear target.",
      "Keep your eyes on the thumb while turning your head slowly left and right.",
      "Move only as far as the target stays reasonably clear.",
      "Rest if the target blurs heavily or symptoms spike."
    ],
    "duration_hint": "1–2 minutes",
    "safety_notes": [
      "Webcam form checks may arrive later; for now, go by comfort and clarity.",
      "Stop if neck pain, severe headache, or unsafe symptoms appear."
    ]
  }'::jsonb,
  1,
  true,
  10
),
(
  'gaze_stabilization',
  '["gaze_instability"]'::jsonb,
  'Wall target horizontal',
  'Focus on a wall mark while gently nodding or turning — small, controlled ranges only.',
  '{
    "steps": [
      "Place a sticky note or mark on a wall at eye height.",
      "Stand or sit an arm''s length away with support available.",
      "Keep eyes on the mark while turning the head slowly side to side.",
      "Keep the range small; clarity matters more than amplitude."
    ],
    "duration_hint": "1–2 minutes",
    "safety_notes": [
      "Choose a quiet, well-lit space.",
      "If symptoms worsen after practice, shorten the next session."
    ]
  }'::jsonb,
  2,
  true,
  20
),
(
  'gaze_stabilization',
  '["gaze_instability","post_concussion_adjacent"]'::jsonb,
  'Near-far focus switch',
  'Alternate focus between a near and far target to practice visual settling without rushing.',
  '{
    "steps": [
      "Hold a near target (thumb or card) and pick a far wall target.",
      "Focus near for two breaths, then far for two breaths.",
      "Switch slowly for several cycles.",
      "Keep the pace gentle; stop if visual strain rises sharply."
    ],
    "duration_hint": "2–3 minutes",
    "safety_notes": [
      "This is a practice tool, not a clinical assessment.",
      "Reduce duration if eyestrain or headache increases."
    ]
  }'::jsonb,
  2,
  false,
  30
),
(
  'balance_training',
  '["postural_control"]'::jsonb,
  'Feet together stand',
  'A quiet standing practice with feet close together, using light support as needed.',
  '{
    "steps": [
      "Stand beside a counter or chair you can lightly touch.",
      "Bring feet close together; keep gaze on a steady point ahead.",
      "Hold for a short count while breathing evenly.",
      "Step into a wider stance to rest, then repeat if comfortable."
    ],
    "duration_hint": "2–4 minutes",
    "safety_notes": [
      "Always keep a support surface within reach.",
      "Stop if you feel you might fall."
    ]
  }'::jsonb,
  1,
  false,
  10
),
(
  'balance_training',
  '["postural_control"]'::jsonb,
  'Tandem stand (supported)',
  'Heel-to-toe standing with optional fingertip support — progress only when steady.',
  '{
    "steps": [
      "Stand next to a counter.",
      "Place one foot directly in front of the other (heel to toe).",
      "Use fingertip support as needed; look ahead, not down.",
      "Hold briefly, then switch lead foot if comfortable."
    ],
    "duration_hint": "2–3 minutes",
    "safety_notes": [
      "Skip barefoot on slippery floors.",
      "This is balance practice, not a fall-risk diagnosis."
    ]
  }'::jsonb,
  3,
  false,
  20
),
(
  'balance_training',
  '["postural_control","fall_risk_reduction"]'::jsonb,
  'Weight shift side to side',
  'Slow side-to-side weight shifts while standing, staying within a comfortable range.',
  '{
    "steps": [
      "Stand with feet hip-width apart near support.",
      "Shift weight gently to one foot, then the other.",
      "Keep movements small and controlled.",
      "Pause and reset if you feel unsteady."
    ],
    "duration_hint": "2–4 minutes",
    "safety_notes": [
      "Do not close your eyes until you feel confident with eyes open.",
      "Use support freely — independence can come later."
    ]
  }'::jsonb,
  2,
  false,
  30
),
(
  'canalith_repositioning',
  '["BPPV"]'::jsonb,
  'Orientation: canalith maneuvers',
  'Educational orientation to canalith repositioning as a different kind of intervention — confirm with a clinician before attempting any maneuver.',
  '{
    "steps": [
      "Read this card as orientation only — not a prescription to self-treat.",
      "BPPV-style repositioning is typically a short series of guided head/body positions.",
      "If you have been told you may have BPPV, ask a clinician which maneuver (if any) fits your case.",
      "Do not attempt complex repositioning sequences from memory if you are unsure which canal or side is involved."
    ],
    "duration_hint": "Read-through",
    "safety_notes": [
      "Clearly different from daily habituation, gaze, or balance practice.",
      "Confirm with a clinician before trying canalith repositioning.",
      "Seek urgent care for sudden severe headache, weakness, speech changes, or facial drooping."
    ]
  }'::jsonb,
  1,
  false,
  10
),
(
  'canalith_repositioning',
  '["BPPV"]'::jsonb,
  'Aftercare mindset (post-maneuver)',
  'Gentle guidance for the hours after a clinician-directed maneuver: rest, hydration, and noting symptom changes — without self-diagnosing.',
  '{
    "steps": [
      "Follow the specific aftercare your clinician gave you first.",
      "Note symptom changes in your tracker rather than repeatedly self-testing.",
      "Avoid aggressive head shaking or DIY re-tests the same day.",
      "Contact your clinician if symptoms are unexpected or worsening."
    ],
    "duration_hint": "Same day",
    "safety_notes": [
      "This card supports recovery habits; it does not replace clinical follow-up.",
      "Emergency symptoms always override routine aftercare."
    ]
  }'::jsonb,
  1,
  false,
  20
);
