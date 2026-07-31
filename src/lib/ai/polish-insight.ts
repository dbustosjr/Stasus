/**
 * Post-process model note text so it reads as plain prose, not markdown.
 */
export function polishInsightProse(text: string): string {
  let t = text.replace(/\r\n/g, "\n").trim();
  if (!t) return t;

  // Paired markdown emphasis
  t = t.replace(/\*\*([^*]+)\*\*/g, "$1");
  t = t.replace(/\*([^*\n]+)\*/g, "$1");
  t = t.replace(/__([^_\n]+)__/g, "$1");

  // Markdown headings / list markers
  t = t.replace(/^\s{0,3}#{1,6}\s+/gm, "");
  t = t.replace(/^\s*[-•]\s+/gm, "");

  // Any leftover asterisks (common AI emphasis tell)
  t = t.replace(/\*/g, "");

  // Em / en dashes as clause breaks → commas
  t = t.replace(/\s*[—–]\s*/g, ", ");

  // Tidy punctuation left by replacements
  t = t.replace(/\s+,/g, ",");
  t = t.replace(/,\s*,+/g, ",");
  t = t.replace(/,\s*\./g, ".");
  t = t.replace(/[ \t]+\n/g, "\n");
  t = t.replace(/\n{3,}/g, "\n\n");
  t = t.replace(/[ \t]{2,}/g, " ");

  return t.trim();
}
