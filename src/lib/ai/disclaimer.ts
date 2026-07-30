export const WELLNESS_REPORT_DISCLAIMER =
  "Stasus is a wellness tool. This note is not medical advice, a diagnosis, or a treatment plan. It does not replace care from a qualified clinician. If you’re worried about your symptoms, talk with your doctor or seek urgent care when appropriate.";

/** Append the standing disclaimer unless the body already includes it. */
export function withDisclaimer(body: string): string {
  const trimmed = body.trim();
  if (/not medical advice/i.test(trimmed)) return trimmed;
  return `${trimmed}\n\n—\n${WELLNESS_REPORT_DISCLAIMER}`;
}
