export type CalmSectionId =
  | "fear-avoidance"
  | "symptom-checking"
  | "grounding"
  | "breathing";

export const CALM_SECTIONS: {
  id: CalmSectionId;
  title: string;
  summary: string;
}[] = [
  {
    id: "fear-avoidance",
    title: "The fear–avoidance loop",
    summary:
      "How checking and avoiding can quietly keep dizziness feeling louder.",
  },
  {
    id: "symptom-checking",
    title: "Reframing symptom checking",
    summary:
      "CBT-style prompts for the urge to monitor every sensation.",
  },
  {
    id: "grounding",
    title: "Grounding when sensations spike",
    summary: "Short orientation tools you can use without forcing calm.",
  },
  {
    id: "breathing",
    title: "Steady breathing",
    summary: "A gentle paced breath — optional, never mandatory.",
  },
];

export const FEAR_AVOIDANCE = {
  title: "The fear–avoidance loop",
  intro:
    "Many people with lingering dizziness notice a cycle: a sensation appears → worry rises → the body braces → checking or avoiding begins → the nervous system stays on alert. Naming the loop is not a diagnosis — it is a map for gently interrupting it.",
  steps: [
    {
      label: "Sensation",
      text: "A wobble, visual busy-ness, or floating feeling shows up.",
    },
    {
      label: "Threat meaning",
      text: "The mind may treat it as danger: “Something is wrong right now.”",
    },
    {
      label: "Protective response",
      text: "Tensing, scanning the body, sitting out of activities, or seeking reassurance.",
    },
    {
      label: "Short relief, longer sensitivity",
      text: "Avoidance can feel safer immediately, while keeping the system primed for the next cue.",
    },
  ],
  practice:
    "When you notice the loop, try one small alternative: log the entry once, then return to a planned practice or a grounding tool — rather than repeated checking.",
};

export const SYMPTOM_CHECKING = {
  title: "Reframing symptom checking",
  intro:
    "Symptom checking is often an attempt to feel safer. These prompts borrow CBT-style structure without claiming to treat a condition.",
  prompts: [
    {
      urge: "I need to check again to make sure I’m okay.",
      reframe:
        "One clear log can be enough for today. Extra checking rarely adds new information — it mostly trains attention to stay on the symptom.",
    },
    {
      urge: "If I don’t monitor this, I’ll miss something serious.",
      reframe:
        "Serious red flags are sudden and hard to miss (see Emergency cues). Ordinary fluctuating dizziness is often better served by paced practice than constant surveillance.",
    },
    {
      urge: "I should wait until I feel 100% before doing anything.",
      reframe:
        "Gentle, graded practice is how many people rebuild tolerance. Waiting for zero symptoms can keep life smaller than it needs to be.",
    },
  ],
};

export const GROUNDING = {
  title: "Grounding when sensations spike",
  tools: [
    {
      name: "5–4–3–2–1 (calm edition)",
      steps: [
        "Name 5 things you can see (quiet objects, not spinning screens).",
        "Name 4 points of contact (feet, seat, hands, back).",
        "Name 3 sounds that are steady and ordinary.",
        "Name 2 textures you can touch.",
        "Name 1 slow breath out.",
      ],
    },
    {
      name: "Orientation sentence",
      steps: [
        "Say (silently or aloud): “I am [place]. It is [time of day]. This feeling can rise and fall.”",
        "Add one next action: “Next I will [log once / stand supported / rest 2 minutes].”",
      ],
    },
  ],
};

export const BREATHING = {
  title: "Steady breathing",
  note: "If breath focus increases dizziness or panic for you, skip this tool and use grounding instead.",
  inhaleSeconds: 4,
  holdSeconds: 0,
  exhaleSeconds: 6,
  cycles: 4,
};

export const EMERGENCY_CUES = {
  title: "Emergency cues",
  body: "Seek emergency care immediately for sudden severe vertigo together with slurred speech, facial drooping, limb weakness, or a sudden severe headache. Stasus is a wellness tool and cannot evaluate emergencies.",
};
