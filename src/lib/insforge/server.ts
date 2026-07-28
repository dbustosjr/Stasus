import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";

/** Server Components, Route Handlers, and Server Actions. */
export async function createInsForgeServerClient() {
  return createServerClient({
    cookies: await cookies(),
  });
}
