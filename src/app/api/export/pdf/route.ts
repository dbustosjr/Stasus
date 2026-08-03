import { fetchExportData } from "@/lib/export/fetch-export-data";
import { buildExportPdf } from "@/lib/export/pdf";
import { requireExportUser } from "@/lib/export/require-export-user";
import { exportFilename } from "@/lib/export/types";
import { assertSameOriginApiRequest } from "@/lib/security/request-guards";

export async function GET() {
  const origin = await assertSameOriginApiRequest();
  if (!origin.ok) {
    return new Response(origin.message, { status: origin.status });
  }

  const auth = await requireExportUser();
  if (!auth) {
    return new Response("Sign in required.", { status: 401 });
  }

  try {
    const payload = await fetchExportData(
      auth.insforge,
      auth.user.id,
      auth.user.email ?? null,
    );
    const bytes = await buildExportPdf(payload);
    const filename = exportFilename("pdf", new Date(), payload.timezone);
    return new Response(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed.";
    return new Response(message, { status: 500 });
  }
}
