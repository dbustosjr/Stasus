import { createAdminClient } from "@insforge/sdk";

/**
 * Project admin client (bypasses RLS). Server-only — requires INSFORGE_API_KEY.
 * Used for trusted writes to ai_insights / ai_call_log after user auth.
 */
export function createInsForgeAdminClient() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const apiKey = process.env.INSFORGE_API_KEY;
  if (!baseUrl || !apiKey) return null;
  return createAdminClient({ baseUrl, apiKey });
}
