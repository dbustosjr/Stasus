import { AppShell } from "@/components/app-shell";
import { isAdminEmail } from "@/lib/auth/admin-emails";
import { requireUser } from "@/lib/auth/require-user";

/**
 * Persistent /app chrome + one auth check per navigation (deduped with page
 * via React cache). Onboarding keeps its own header via AppShell path gate.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireUser();

  return (
    <AppShell email={user.email} showAdmin={isAdminEmail(user.email)}>
      {children}
    </AppShell>
  );
}
