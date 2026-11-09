import type { Exercise } from "../../exercises/types.ts";

/**
 * Frozen snapshot of the live exercise library seed (auth-gated in InsForge).
 * Stable IDs so demo deep-links stay valid across sessionStorage resets.
 */
export const DEMO_EXERCISES: Exercise[] = [
  {
    id: "demo-ex-hab-scan",
    category: "habituation",
    condition_tags: ["PPPD", "motion_sensitivity"],
    title: "Seated visual scan",
    description:
      "A calm starting practice: slowly look across a quiet room while seated, noticing symptoms without pushing through distress.",
    instructions: {
      steps: [
        "Sit supported with both feet on the floor.",
        "Choose three quiet visual points left, center, and right.",
        "Look to each point for a few seconds, then return to center.",
        "Stop if symptoms rise sharply; rest and retry later at a gentler pace.",
      ],
      duration_hint: "3–5 minutes",
      safety_notes: [
        "This is general wellness practice, not a diagnosis or treatment plan.",
        "Stop if you feel unsafe or symptoms become severe.",
      ],
    },
    difficulty_level: 1,
    requires_cv_tracking: true,
    sort_order: 10,
  },
  {
    id: "demo-ex-hab-pattern",
    category: "habituation",
    condition_tags: ["PPPD", "visual_sensitivity"],
    title: "Pattern glance (low intensity)",
    description:
      "Brief, paced glances at a mildly busy pattern (like a striped cloth) to practice staying oriented.",
    instructions: {
      steps: [
        "Place a mildly patterned item a comfortable distance away.",
        "Look at a plain wall, then glance at the pattern for 1–2 seconds.",
        "Return to the plain wall and breathe slowly.",
        "Repeat a few cycles; keep intensity low enough that you can finish calmly.",
      ],
      duration_hint: "2–4 minutes",
      safety_notes: [
        "Avoid aggressive or flashing visuals.",
        "Increase exposure only when the current level feels manageable.",
      ],
    },
    difficulty_level: 2,
    requires_cv_tracking: true,
    sort_order: 20,
  },
  {
    id: "demo-ex-hab-sitstand",
    category: "habituation",
    condition_tags: ["PPPD", "motion_sensitivity"],
    title: "Slow sit-to-stand with pause",
    description:
      "Practice changing position with deliberate pauses so your system can settle between movements.",
    instructions: {
      steps: [
        "Sit near a stable surface you can touch if needed.",
        "Stand up slowly, pause for two breaths at the top.",
        "Sit back down slowly, pause again.",
        "Repeat a few times, prioritizing steadiness over speed.",
      ],
      duration_hint: "3–5 minutes",
      safety_notes: [
        "Use support if you feel unsteady.",
        "Skip if you have acute injury or feel unsafe standing.",
      ],
    },
    difficulty_level: 2,
    requires_cv_tracking: true,
    sort_order: 30,
  },
  {
    id: "demo-ex-gaze-thumb",
    category: "gaze_stabilization",
    condition_tags: ["gaze_instability", "post_acute"],
    title: "Thumb target (seated)",
    description:
      "Keep a nearby target clear while your head turns gently — a foundational gaze practice.",
    instructions: {
      steps: [
        "Hold your thumb at arm's length as a clear target.",
        "Keep your eyes on the thumb while turning your head slowly left and right.",
        "Move only as far as the target stays reasonably clear.",
        "Rest if the target blurs heavily or symptoms spike.",
      ],
      duration_hint: "1–2 minutes",
      safety_notes: [
        "Practice support only — not a clinical assessment.",
        "Stop if neck pain, severe headache, or unsafe symptoms appear.",
      ],
    },
    difficulty_level: 1,
    requires_cv_tracking: true,
    sort_order: 10,
  },
  {
    id: "demo-ex-gaze-wall",
    category: "gaze_stabilization",
    condition_tags: ["gaze_instability"],
    title: "Wall target horizontal",
    description:
      "Focus on a wall mark while gently nodding or turning — small, controlled ranges only.",
    instructions: {
      steps: [
        "Place a sticky note or mark on a wall at eye height.",
        "Stand or sit an arm's length away with support available.",
        "Keep eyes on the mark while turning the head slowly side to side.",
        "Keep the range small; clarity matters more than amplitude.",
      ],
      duration_hint: "1–2 minutes",
      safety_notes: [
        "Choose a quiet, well-lit space.",
        "If symptoms worsen after practice, shorten the next session.",
      ],
    },
    difficulty_level: 2,
    requires_cv_tracking: true,
    sort_order: 20,
  },
  {
    id: "demo-ex-gaze-nearfar",
    category: "gaze_stabilization",
    condition_tags: ["gaze_instability", "post_concussion_adjacent"],
    title: "Near-far focus switch",
    description:
      "Alternate focus between a near and far target to practice visual settling without rushing.",
    instructions: {
      steps: [
        "Hold a near target (thumb or card) and pick a far wall target.",
        "Focus near for two breaths, then far for two breaths.",
        "Switch slowly for several cycles.",
        "Keep the pace gentle; stop if visual strain rises sharply.",
      ],
      duration_hint: "2–3 minutes",
      safety_notes: [
        "This is a practice tool, not a clinical assessment.",
        "Reduce duration if eyestrain or headache increases.",
      ],
    },
    difficulty_level: 2,
    requires_cv_tracking: true,
    sort_order: 30,
  },
  {
    id: "demo-ex-bal-feet",
    category: "balance_training",
    condition_tags: ["postural_control"],
    title: "Feet together stand",
    description:
      "A quiet standing practice with feet close together, using light support as needed.",
    instructions: {
      steps: [
        "Stand beside a counter or chair you can lightly touch.",
        "Bring feet close together; keep gaze on a steady point ahead.",
        "Hold for a short count while breathing evenly.",
        "Step into a wider stance to rest, then repeat if comfortable.",
      ],
      duration_hint: "2–4 minutes",
      safety_notes: [
        "Always keep a support surface within reach.",
        "Stop if you feel you might fall.",
      ],
    },
    difficulty_level: 1,
    requires_cv_tracking: true,
    sort_order: 10,
  },
  {
    id: "demo-ex-bal-tandem",
    category: "balance_training",
    condition_tags: ["postural_control"],
    title: "Tandem stand (supported)",
    description:
      "Heel-to-toe standing with optional fingertip support — progress only when steady.",
    instructions: {
      steps: [
        "Stand next to a counter.",
        "Place one foot directly in front of the other (heel to toe).",
        "Use fingertip support as needed; look ahead, not down.",
        "Hold briefly, then switch lead foot if comfortable.",
      ],
      duration_hint: "2–3 minutes",
      safety_notes: [
        "Skip barefoot on slippery floors.",
        "This is balance practice, not a fall-risk diagnosis.",
      ],
    },
    difficulty_level: 3,
    requires_cv_tracking: true,
    sort_order: 20,
  },
  {
    id: "demo-ex-bal-shift",
    category: "balance_training",
    condition_tags: ["postural_control", "fall_risk_reduction"],
    title: "Weight shift side to side",
    description:
      "Slow side-to-side weight shifts while standing, staying within a comfortable range.",
    instructions: {
      steps: [
        "Stand with feet hip-width apart near support.",
        "Shift weight gently to one foot, then the other.",
        "Keep movements small and controlled.",
        "Pause and reset if you feel unsteady.",
      ],
      duration_hint: "2–4 minutes",
      safety_notes: [
        "Do not close your eyes until you feel confident with eyes open.",
        "Use support freely — independence can come later.",
      ],
    },
    difficulty_level: 2,
    requires_cv_tracking: true,
    sort_order: 30,
  },
  {
    id: "demo-ex-bppv-orient",
    category: "canalith_repositioning",
    condition_tags: ["BPPV"],
    title: "Orientation: canalith maneuvers",
    description:
      "Educational orientation to canalith repositioning as a different kind of intervention — confirm with a clinician before attempting any maneuver.",
    instructions: {
      steps: [
        "Read this card as orientation only — not a prescription to self-treat.",
        "BPPV-style repositioning is typically a short series of guided head/body positions.",
        "If you have been told you may have BPPV, ask a clinician which maneuver (if any) fits your case.",
        "Do not attempt complex repositioning sequences from memory if you are unsure which canal or side is involved.",
      ],
      duration_hint: "Read-through",
      safety_notes: [
        "Clearly different from daily habituation, gaze, or balance practice.",
        "Confirm with a clinician before trying canalith repositioning.",
        "Seek urgent care for sudden severe headache, weakness, speech changes, or facial drooping.",
      ],
    },
    difficulty_level: 1,
    requires_cv_tracking: false,
    sort_order: 10,
  },
  {
    id: "demo-ex-bppv-after",
    category: "canalith_repositioning",
    condition_tags: ["BPPV"],
    title: "Aftercare mindset (post-maneuver)",
    description:
      "Gentle guidance for the hours after a clinician-directed maneuver: rest, hydration, and noting symptom changes — without self-diagnosing.",
    instructions: {
      steps: [
        "Follow the specific aftercare your clinician gave you first.",
        "Note symptom changes in your tracker rather than repeatedly self-testing.",
        "Avoid aggressive head shaking or DIY re-tests the same day.",
        "Contact your clinician if symptoms are unexpected or worsening.",
      ],
      duration_hint: "Same day",
      safety_notes: [
        "This card supports recovery habits; it does not replace clinical follow-up.",
        "Emergency symptoms always override routine aftercare.",
      ],
    },
    difficulty_level: 1,
    requires_cv_tracking: false,
    sort_order: 20,
  },
];
