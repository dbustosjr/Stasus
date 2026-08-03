import { cache } from "react";
import { redirect } from "next/navigation";
import { createInsForgeServerClient } from "@/lib/insforge/server";

/**
 * Request-scoped auth. `cache()` dedupes within one RSC/action tree so layout
 * + page do not double-hit getCurrentUser.
 */
export const requireUser = cache(async () => {
  const insforge = await createInsForgeServerClient();
  const { data, error } = await insforge.auth.getCurrentUser();
  const user = data?.user ?? null;

  if (error || !user) {
    redirect("/login");
  }

  return { insforge, user };
});
