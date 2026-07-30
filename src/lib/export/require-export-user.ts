import { createInsForgeServerClient } from "@/lib/insforge/server";

export async function requireExportUser() {
  const insforge = await createInsForgeServerClient();
  const { data, error } = await insforge.auth.getCurrentUser();
  const user = data?.user ?? null;
  if (error || !user) {
    return null;
  }
  return { insforge, user };
}
