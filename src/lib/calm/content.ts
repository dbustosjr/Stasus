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
    title: "The fear-avoidance loop",
    summary:
      "How checking and avoiding can quietly keep dizziness feeling louder.",
  },
  {
    id: "symptom-checking",
    title: "When you keep checking",
    summary: "A few kinder ways to talk back to the urge to monitor every blip.",
  },
  {
    id: "grounding",
    title: "Grounding when sensations spike",
    summary: "Short ways to orient yourself without forcing calm.",
  },
  {
    id: "breathing",
    title: "Steady breathing",
    summary: "A gentle paced breath if it helps. Skip it if it does not.",
  },
];

export const FEAR_AVOIDANCE = {
  title: "The fear-avoidance loop",
  intro:
    "A lot of people with lingering dizziness notice the same cycle: a sensation shows up, worry climbs, the body braces, then checking or avoiding takes over and the nervous system stays on edge. Naming the loop is not a diagnosis. It is just a map for interrupting it gently.",
  steps: [
    {
      label: "Sensation",
      text: "A wobble, busy visuals, or that floating feeling shows up.",
    },
    {
      label: "Threat meaning",
      text: "The mind treats it like danger: “Something is wrong right now.”",
    },
    {
      label: "Protective response",
      text: "Tensing, scanning the body, sitting things out, or hunting for reassurance.",
    },
    {
      label: "Short relief, longer sensitivity",
      text: "Avoidance can feel safer right away, while keeping the system primed for the next cue.",
    },
  ],
  practice:
    "When you notice the loop, try one small alternative: log once, then go back to a planned practice or a grounding tool instead of checking again.",
};

export const SYMPTOM_CHECKING = {
  title: "When you keep checking",
  intro:
    "Checking is usually an attempt to feel safer. These prompts borrow a CBT-style shape without claiming to treat anything.",
  prompts: [
    {
      urge: "I need to check again to make sure I’m okay.",
      reframe:
        "One clear log can be enough for today. Extra checking rarely adds new information. Mostly it keeps your attention glued to the symptom.",
    },
    {
      urge: "If I don’t monitor this, I’ll miss something serious.",
      reframe:
        "Serious red flags are sudden and hard to miss (see Emergency cues). Ordinary fluctuating dizziness is often better served by paced practice than constant watching.",
    },
    {
      urge: "I should wait until I feel 100% before doing anything.",
      reframe:
        "Gentle, graded practice is how a lot of people rebuild tolerance. Waiting for zero symptoms can keep life smaller than it needs to be.",
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
        "Add one next action: “Next I will [log once / stand with support / rest 2 minutes].”",
      ],
    },
  ],
};

export const BREATHING = {
  title: "Steady breathing",
  note: "If focusing on breath makes dizziness or panic worse for you, skip this and use grounding instead.",
  inhaleSeconds: 4,
  holdSeconds: 0,
  exhaleSeconds: 6,
  cycles: 4,
};

export const EMERGENCY_CUES = {
  title: "Emergency cues",
  body: "Get emergency care right away for sudden severe vertigo together with slurred speech, facial drooping, limb weakness, or a sudden severe headache. Stasus is a wellness tool and cannot evaluate emergencies.",
};
