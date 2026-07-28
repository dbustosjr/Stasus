import { redirect } from "next/navigation";
import { createInsForgeServerClient } from "@/lib/insforge/server";

export async function requireUser() {
  const insforge = await createInsForgeServerClient();
  const { data, error } = await insforge.auth.getCurrentUser();
  const user = data?.user ?? null;

  if (error || !user) {
    redirect("/login");
  }

  return { insforge, user };
}
