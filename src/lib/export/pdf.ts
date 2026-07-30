import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { WELLNESS_REPORT_DISCLAIMER } from "@/lib/ai/disclaimer";
import {
  formatExportDateTime,
  formatExportDurationMinutes,
  formatExportDurationSeconds,
} from "@/lib/export/format";
import type { ExportPayload } from "@/lib/export/types";

const MARGIN = 48;
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;

function wrapText(
  text: string,
  font: { widthOfTextAtSize: (t: string, size: number) => number },
  size: number,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];
  const lines: string[] = [];
  let current = words[0]!;
  for (let i = 1; i < words.length; i++) {
    const next = `${current} ${words[i]}`;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      lines.push(current);
      current = words[i]!;
    }
  }
  lines.push(current);
  return lines;
}

export async function buildExportPdf(payload: ExportPayload): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const maxWidth = PAGE_WIDTH - MARGIN * 2;
  const tz = payload.timezone;

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  };

  const drawLine = (
    text: string,
    size: number,
    opts?: { bold?: boolean; gapAfter?: number },
  ) => {
    const f = opts?.bold ? bold : font;
    const gap = opts?.gapAfter ?? size + 4;
    for (const line of wrapText(text, f, size, maxWidth)) {
      ensureSpace(gap);
      page.drawText(line, {
        x: MARGIN,
        y,
        size,
        font: f,
        color: rgb(0.05, 0.08, 0.1),
        maxWidth,
      });
      y -= gap;
    }
  };

  const drawSpacer = (amount = 10) => {
    ensureSpace(amount);
    y -= amount;
  };

  drawLine("Stasus data export", 18, { bold: true, gapAfter: 18 });
  drawLine(`Exported: ${formatExportDateTime(payload.exported_at, tz)}`, 10, {
    gapAfter: 14,
  });
  drawLine(`Time zone: ${tz}`, 10, { gapAfter: 14 });
  drawLine(
    payload.email ? `Account: ${payload.email}` : "Account: (not available)",
    10,
    { gapAfter: 14 },
  );
  drawLine(
    "Includes symptom logs (saved and archived) and practice sessions.",
    10,
    { gapAfter: 14 },
  );
  drawSpacer(8);

  drawLine(`Symptom logs (${payload.logs.length})`, 13, {
    bold: true,
    gapAfter: 16,
  });

  if (payload.logs.length === 0) {
    drawLine("No symptom logs.", 10, { gapAfter: 14 });
  } else {
    for (const log of payload.logs) {
      const when = formatExportDateTime(log.logged_at, tz);
      const duration = formatExportDurationMinutes(log.duration_minutes);
      const metaParts = [
        `Severity ${log.severity}/10`,
        duration || null,
        log.archived ? "Archived" : null,
      ].filter(Boolean);

      drawLine(when, 10, { bold: true, gapAfter: 13 });
      drawLine(metaParts.join("   ·   "), 9, { gapAfter: 12 });
      drawLine(
        log.triggers.length
          ? `Triggers: ${log.triggers.join(", ")}`
          : "Triggers: (none)",
        9,
        { gapAfter: 12 },
      );
      drawLine(log.notes ? `Notes: ${log.notes}` : "Notes: (none)", 9, {
        gapAfter: 12,
      });
      drawSpacer(10);
    }
  }

  drawSpacer(6);
  drawLine(`Practice sessions (${payload.sessions.length})`, 13, {
    bold: true,
    gapAfter: 16,
  });

  if (payload.sessions.length === 0) {
    drawLine("No practice sessions.", 10, { gapAfter: 14 });
  } else {
    for (const session of payload.sessions) {
      const when = formatExportDateTime(session.completed_at, tz);
      const duration = formatExportDurationSeconds(session.duration_seconds);

      drawLine(when, 10, { bold: true, gapAfter: 13 });
      drawLine(
        duration
          ? `${session.exercise_title}   ·   ${duration}`
          : session.exercise_title,
        9,
        { gapAfter: 12 },
      );
      drawLine(
        session.notes ? `Notes: ${session.notes}` : "Notes: (none)",
        9,
        { gapAfter: 12 },
      );
      drawSpacer(10);
    }
  }

  drawSpacer(8);
  drawLine(WELLNESS_REPORT_DISCLAIMER, 8, { gapAfter: 11 });

  return doc.save();
}
