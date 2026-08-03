import { headers } from "next/headers";

/**
 * Reject cross-site API calls that look like CSRF against cookie sessions.
 * Next.js server actions already check Origin; route handlers need this explicitly.
 */
export async function assertSameOriginApiRequest(): Promise<
  { ok: true } | { ok: false; status: number; message: string }
> {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";

  // Same-origin navigations / downloads often omit Origin; allow those.
  if (!origin) {
    const referer = h.get("referer");
    if (!referer) return { ok: true };
    try {
      const ref = new URL(referer);
      if (host && ref.host === host) return { ok: true };
      return { ok: false, status: 403, message: "Forbidden." };
    } catch {
      return { ok: false, status: 403, message: "Forbidden." };
    }
  }

  try {
    const o = new URL(origin);
    if (host && o.host === host) return { ok: true };
    // Local / preview: compare against configured app URL when host headers differ.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl) {
      const app = new URL(appUrl);
      if (o.origin === app.origin) return { ok: true };
    }
    // Allow matching proto+host construction
    if (host && o.origin === `${proto}://${host}`) return { ok: true };
    return { ok: false, status: 403, message: "Forbidden." };
  } catch {
    return { ok: false, status: 403, message: "Forbidden." };
  }
}

/** Clamp untrusted string length (JS has no classic buffer overflow; still bound inputs). */
export function clampText(value: unknown, max: number): string {
  return String(value ?? "").slice(0, max);
}
