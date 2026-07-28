import { createBrowserClient } from "@insforge/sdk/ssr";

/**
 * Browser/SSR-aware InsForge client.
 * Uses public anon key + access-token cookie; refreshes via /api/auth/refresh.
 * Auth mutations (sign-in/up/out) must use server actions — not this client.
 */
export function getInsforge() {
  return createBrowserClient();
}
