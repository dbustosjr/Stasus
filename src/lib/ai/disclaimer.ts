export const WELLNESS_REPORT_DISCLAIMER =
  "Stasus is a wellness tool. This note is not medical advice, a diagnosis, or a treatment plan, and it does not replace care from a clinician. If you are worried about your symptoms, talk with your doctor or get urgent care when you need it.";

const DISCLAIMER_MARKER = /(?:^|\n)\s*[—–-]?\s*\n?\s*Stasus is a wellness tool\./i;

/** Append the standing disclaimer unless the body already includes it. */
export function withDisclaimer(body: string): string {
  const trimmed = body.trim();
  if (/not medical advice/i.test(trimmed)) return trimmed;
  return `${trimmed}\n\n${WELLNESS_REPORT_DISCLAIMER}`;
}

/** Split stored note text so the UI can style the disclaimer in muted teal. */
export function splitInsightDisclaimer(text: string): {
  body: string;
  showDisclaimer: boolean;
} {
  const trimmed = text.trim();
  if (!/not medical advice/i.test(trimmed)) {
    return { body: trimmed, showDisclaimer: true };
  }

  const idx = trimmed.search(DISCLAIMER_MARKER);
  if (idx >= 0) {
    return {
      body: trimmed.slice(0, idx).trim(),
      showDisclaimer: true,
    };
  }

  // Disclaimer present but not in the usual trailing form: show body as-is
  // and still render the standard teal footer.
  return { body: trimmed, showDisclaimer: true };
}
