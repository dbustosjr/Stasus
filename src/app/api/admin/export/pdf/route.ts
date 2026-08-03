import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { requireAdminUser } from "@/lib/admin/require-admin";
import { fetchDeidentifiedPlatformReport } from "@/lib/admin/fetch-platform-report";
import { deidentifiedReportToText } from "@/lib/admin/platform-analytics";
import { assertSameOriginApiRequest } from "@/lib/security/request-guards";

export async function GET() {
  const origin = await assertSameOriginApiRequest();
  if (!origin.ok) {
    return NextResponse.json({ error: origin.message }, { status: origin.status });
  }

  const { allowed } = await requireAdminUser();
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { report, error } = await fetchDeidentifiedPlatformReport();
  if (!report) {
    return NextResponse.json({ error: error ?? "Export failed" }, { status: 500 });
  }

  const text = deidentifiedReportToText(report);
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page = doc.addPage([612, 792]);
  let y = 744;
  const margin = 48;
  const maxWidth = 612 - margin * 2;
  const size = 10;

  for (const line of text.split("\n")) {
    const isHeading =
      line === "Stasus platform report (de-identified)" ||
      line === "Usage (local calendar)" ||
      line === "Totals" ||
      line === "Average severity" ||
      line === "Sessions by category" ||
      line === "Insights by cadence" ||
      line === "Activity source days";
    const useFont = isHeading ? bold : font;
    const useSize = isHeading ? 12 : size;
    const words = line.length ? line.split(/\s+/) : [""];
    let current = words[0] ?? "";
    const wrapped: string[] = [];
    for (let i = 1; i < words.length; i++) {
      const next = `${current} ${words[i]}`;
      if (useFont.widthOfTextAtSize(next, useSize) <= maxWidth) {
        current = next;
      } else {
        wrapped.push(current);
        current = words[i]!;
      }
    }
    wrapped.push(current);

    for (const w of wrapped) {
      if (y < 56) {
        page = doc.addPage([612, 792]);
        y = 744;
      }
      page.drawText(w || " ", {
        x: margin,
        y,
        size: useSize,
        font: useFont,
        color: rgb(0.05, 0.1, 0.12),
      });
      y -= useSize + 6;
    }
  }

  const bytes = await doc.save();
  const day = report.generatedAt.slice(0, 10);
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="stasus-platform-deidentified-${day}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
