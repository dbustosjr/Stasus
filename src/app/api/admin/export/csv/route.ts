import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/require-admin";
import { fetchDeidentifiedPlatformReport } from "@/lib/admin/fetch-platform-report";
import { deidentifiedReportToCsv } from "@/lib/admin/platform-analytics";
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

  const body = deidentifiedReportToCsv(report);
  const day = report.generatedAt.slice(0, 10);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="stasus-platform-deidentified-${day}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
