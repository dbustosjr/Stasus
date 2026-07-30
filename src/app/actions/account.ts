"use server";

import { redirect } from "next/navigation";
import { createAuthActions } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth/require-user";
import { createInsForgeAdminClient } from "@/lib/insforge/admin";

export type DeleteAccountState = {
  error: string | null;
};

/**
 * Permanently deletes the signed-in auth user (admin API) and cascades
 * all related app rows (profiles, logs, sessions, insights, activity, etc.).
 */
export async function deleteAccount(
  _prev: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const confirm = String(formData.get("confirm") ?? "").trim().toUpperCase();
  if (confirm !== "DELETE") {
    return { error: 'Type DELETE to confirm account deletion.' };
  }

  const { user } = await requireUser();
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const apiKey = process.env.INSFORGE_API_KEY;

  if (!baseUrl || !apiKey) {
    return {
      error:
        "Account deletion is unavailable: server admin key is not configured.",
    };
  }

  // Best-effort explicit wipe (CASCADE also runs when auth user is deleted).
  const admin = createInsForgeAdminClient();
  if (admin) {
    const tables: Array<{ table: string; column: string }> = [
      { table: "ai_insights", column: "user_id" },
      { table: "ai_call_log", column: "user_id" },
      { table: "red_flag_events", column: "user_id" },
      { table: "user_activity_days", column: "user_id" },
      { table: "exercise_sessions", column: "user_id" },
      { table: "symptom_logs", column: "user_id" },
      { table: "custom_triggers", column: "user_id" },
      { table: "profiles", column: "id" },
    ];
    for (const { table, column } of tables) {
      await admin.database.from(table).delete().eq(column, user.id);
    }
  }

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/auth/users`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userIds: [user.id] }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      error:
        text.slice(0, 200) ||
        `Could not delete account (${res.status}). Try again or contact support.`,
    };
  }

  const auth = createAuthActions({ cookies: await cookies() });
  await auth.signOut();
  redirect("/?deleted=1");
}
