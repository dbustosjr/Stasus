import { createInsForgeAdminClient } from "@/lib/insforge/admin";
import {
  buildDeidentifiedPlatformReport,
  type DeidentifiedPlatformReport,
} from "@/lib/admin/platform-analytics";

export async function fetchDeidentifiedPlatformReport(): Promise<
  | { report: DeidentifiedPlatformReport; error: null }
  | { report: null; error: string }
> {
  const admin = createInsForgeAdminClient();
  if (!admin) {
    return { report: null, error: "INSFORGE_API_KEY is not configured." };
  }

  const [
    activityRes,
    profilesRes,
    sessionsRes,
    exercisesRes,
    logsRes,
    insightsRes,
    protocolsRes,
    consentsRes,
  ] = await Promise.all([
    admin.database
      .from("user_activity_days")
      .select("user_id, activity_date, sources")
      .limit(8000),
    admin.database.from("profiles").select("id, timezone").limit(5000),
    admin.database
      .from("exercise_sessions")
      .select("completed_at, exercise_id")
      .limit(8000),
    admin.database.from("exercises").select("id, category").limit(500),
    admin.database
      .from("symptom_logs")
      .select("severity, created_at")
      .limit(8000),
    admin.database.from("ai_insights").select("cadence").limit(8000),
    admin.database
      .from("protocol_events")
      .select("exercise_category, ended_at")
      .limit(5000),
    admin.database
      .from("research_consent")
      .select("consented_at, revoked_at")
      .limit(5000),
  ]);

  const firstError =
    activityRes.error?.message ||
    profilesRes.error?.message ||
    sessionsRes.error?.message ||
    exercisesRes.error?.message ||
    logsRes.error?.message ||
    insightsRes.error?.message ||
    protocolsRes.error?.message ||
    consentsRes.error?.message;

  if (firstError) {
    return { report: null, error: firstError };
  }

  const report = buildDeidentifiedPlatformReport({
    activity: (activityRes.data ?? []) as Array<{
      user_id: string;
      activity_date: string;
      sources?: unknown;
    }>,
    profiles: (profilesRes.data ?? []) as Array<{
      id: string;
      timezone?: string;
    }>,
    sessions: (sessionsRes.data ?? []) as Array<{
      completed_at: string;
      exercise_id: string;
    }>,
    exercises: (exercisesRes.data ?? []) as Array<{
      id: string;
      category: string;
    }>,
    logs: (logsRes.data ?? []) as Array<{
      severity: number;
      created_at: string;
    }>,
    insights: (insightsRes.data ?? []) as Array<{ cadence: string }>,
    protocols: (protocolsRes.data ?? []) as Array<{
      exercise_category: string;
      ended_at: string | null;
    }>,
    consents: (consentsRes.data ?? []) as Array<{
      consented_at: string | null;
      revoked_at: string | null;
    }>,
  });

  return { report, error: null };
}
