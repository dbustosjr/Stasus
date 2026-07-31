/** Parse filename= from a Content-Disposition header, else fallback. */
export function pickExportFilename(
  contentDisposition: string | null | undefined,
  fallback: string,
): string {
  if (!contentDisposition) return fallback;
  const match = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)"?/i);
  if (!match?.[1]) return fallback;
  try {
    return decodeURIComponent(match[1].trim());
  } catch {
    return match[1].trim() || fallback;
  }
}

/** Whether the browser can share a File via Web Share API. */
export function canShareFiles(file: File): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }
  if (typeof navigator.canShare !== "function") {
    return true;
  }
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

export type DownloadExportResult = "shared" | "downloaded";

/**
 * Fetch an export path and share via Web Share when possible,
 * otherwise trigger a programmatic download. Never navigates the tab.
 */
export async function downloadExport(
  path: string,
  fallbackName: string,
): Promise<DownloadExportResult> {
  const response = await fetch(path, { credentials: "same-origin" });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Export failed (${response.status})`);
  }

  const blob = await response.blob();
  const filename = pickExportFilename(
    response.headers.get("Content-Disposition"),
    fallbackName,
  );
  const file = new File([blob], filename, {
    type: blob.type || "application/octet-stream",
  });

  if (canShareFiles(file)) {
    await navigator.share({ files: [file], title: filename });
    return "shared";
  }

  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
  return "downloaded";
}
