import { requireUser } from "@/lib/auth/require-user";
import { isAdminEmail } from "@/lib/auth/admin-emails";

export async function requireAdminUser() {
  const ctx = await requireUser();
  if (!isAdminEmail(ctx.user.email)) {
    return { ...ctx, allowed: false as const };
  }
  return { ...ctx, allowed: true as const };
}
