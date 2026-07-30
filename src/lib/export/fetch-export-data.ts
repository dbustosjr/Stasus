import { triggerLabel } from "@/lib/tracker/types";
import {
  EXPORT_ROW_LIMIT,
  type ExportPayload,
  type ExportPracticeSession,
  type ExportSymptomLog,
} from "@/lib/export/types";
import { normalizeTimeZone } from "@/lib/time/local-calendar";
import type { createInsForgeServerClient } from "@/lib/insforge/server";

type ServerClient = Awaited<ReturnType<typeof createInsForgeServerClient>>;

export async function fetchExportData(
  insforge: ServerClient,
  userId: string,
  email: string | null,
): Promise<ExportPayload> {
  const [{ data: profile }, { data: logRows, error: logError }, sessionsResult] =
    await Promise.all([
      insforge.database
        .from("profiles")
        .select("timezone")
        .eq("id", userId)
        .maybeSingle(),
      insforge.database
        .from("symptom_logs")
        .select(
          "severity, duration_minutes, triggers, notes, logged_at, archived_at",
        )
        .eq("user_id", userId)
        .order("logged_at", { ascending: false })
        .limit(EXPORT_ROW_LIMIT),
      insforge.database
        .from("exercise_sessions")
        .select(
          "completed_at, duration_seconds, notes, exercise_id, exercises(title)",
        )
        .eq("user_id", userId)
        .order("completed_at", { ascending: false })
        .limit(EXPORT_ROW_LIMIT),
    ]);

  const timezone = normalizeTimeZone(
    (profile as { timezone?: string | null } | null)?.timezone,
  );

  let sessionRows: Record<string, unknown>[] | null = null;
  let sessionError = sessionsResult.error;

  if (!sessionError && sessionsResult.data) {
    sessionRows = sessionsResult.data as Record<string, unknown>[];
  }

  if (sessionError) {
    const fallback = await insforge.database
      .from("exercise_sessions")
      .select("completed_at, duration_seconds, notes, exercise_id")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(EXPORT_ROW_LIMIT);
    sessionRows = (fallback.data as Record<string, unknown>[] | null) ?? null;
    sessionError = fallback.error;
  }

  if (logError) {
    throw new Error(`Could not load symptom logs: ${logError.message}`);
  }
  if (sessionError) {
    throw new Error(`Could not load practice sessions: ${sessionError.message}`);
  }

  const titleById = new Map<string, string>();
  const missingIds = new Set<string>();
  for (const row of sessionRows ?? []) {
    const r = row as Record<string, unknown>;
    const exercise = r.exercises as { title?: string } | { title?: string }[] | null;
    if (Array.isArray(exercise) && exercise[0]?.title) {
      continue;
    }
    if (exercise && !Array.isArray(exercise) && exercise.title) {
      continue;
    }
    if (r.exercise_id) missingIds.add(String(r.exercise_id));
  }
  if (missingIds.size > 0) {
    const { data: exercises } = await insforge.database
      .from("exercises")
      .select("id, title")
      .in("id", [...missingIds]);
    for (const ex of exercises ?? []) {
      const e = ex as { id: string; title: string };
      titleById.set(String(e.id), String(e.title));
    }
  }

  const logs: ExportSymptomLog[] = (logRows ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const triggers = Array.isArray(r.triggers)
      ? (r.triggers as string[]).map((t) => triggerLabel(t))
      : [];
    return {
      logged_at: String(r.logged_at ?? ""),
      severity: Number(r.severity),
      duration_minutes:
        r.duration_minutes === null || r.duration_minutes === undefined
          ? null
          : Number(r.duration_minutes),
      triggers,
      notes: (r.notes as string | null) ?? null,
      archived: Boolean(r.archived_at),
    };
  });

  const sessions: ExportPracticeSession[] = (sessionRows ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const exercise = r.exercises as { title?: string } | { title?: string }[] | null;
    let title = "Unknown exercise";
    if (Array.isArray(exercise) && exercise[0]?.title) {
      title = String(exercise[0].title);
    } else if (exercise && !Array.isArray(exercise) && exercise.title) {
      title = String(exercise.title);
    } else if (r.exercise_id && titleById.has(String(r.exercise_id))) {
      title = titleById.get(String(r.exercise_id))!;
    }
    return {
      completed_at: String(r.completed_at ?? ""),
      exercise_title: title,
      duration_seconds:
        r.duration_seconds === null || r.duration_seconds === undefined
          ? null
          : Number(r.duration_seconds),
      notes: (r.notes as string | null) ?? null,
    };
  });

  return {
    exported_at: new Date().toISOString(),
    email,
    timezone,
    logs,
    sessions,
  };
}
