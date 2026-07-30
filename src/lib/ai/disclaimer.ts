export const WELLNESS_REPORT_DISCLAIMER =
  "Stasus is a wellness tool. This note is not medical advice, a diagnosis, or a treatment plan, and it does not replace care from a clinician. If you are worried about your symptoms, talk with your doctor or get urgent care when you need it.";

/** Append the standing disclaimer unless the body already includes it. */
export function withDisclaimer(body: string): string {
  const trimmed = body.trim();
  if (/not medical advice/i.test(trimmed)) return trimmed;
  return `${trimmed}\n\n—\n${WELLNESS_REPORT_DISCLAIMER}`;
}
