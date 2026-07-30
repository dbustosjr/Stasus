"use server";

import { requireUser } from "@/lib/auth/require-user";
import {
  localDateString,
  normalizeTimeZone,
} from "@/lib/time/local-calendar";

export type ActivitySource = "symptom_log" | "exercise" | "calm";

async function loadTimezone(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insforge: any,
  userId: string,
): Promise<string> {
  const { data } = await insforge.database
    .from("profiles")
    .select("timezone")
    .eq("id", userId)
    .maybeSingle();
  return normalizeTimeZone(
    data && typeof data === "object" && "timezone" in data
      ? String((data as { timezone?: string }).timezone ?? "UTC")
      : "UTC",
  );
}

/** Upsert today's local activity day and merge source flags. */
export async function recordActivityDay(
  source: ActivitySource,
): Promise<void> {
  const { insforge, user } = await requireUser();
  const tz = await loadTimezone(insforge, user.id);
  const activityDate = localDateString(tz);

  const { data: existing } = await insforge.database
    .from("user_activity_days")
    .select("sources")
    .eq("user_id", user.id)
    .eq("activity_date", activityDate)
    .maybeSingle();

  const prev =
    existing &&
    typeof existing === "object" &&
    existing !== null &&
    "sources" in existing &&
    existing.sources &&
    typeof existing.sources === "object"
      ? (existing.sources as Record<string, boolean>)
      : {};

  const sources = { ...prev, [source]: true };

  if (existing) {
    await insforge.database
      .from("user_activity_days")
      .update({ sources, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("activity_date", activityDate);
  } else {
    await insforge.database.from("user_activity_days").insert([
      {
        user_id: user.id,
        activity_date: activityDate,
        sources,
      },
    ]);
  }
}

export async function upsertTimezone(timeZone: string): Promise<void> {
  const { insforge, user } = await requireUser();
  const tz = normalizeTimeZone(timeZone);
  await insforge.database
    .from("profiles")
    .update({ timezone: tz })
    .eq("id", user.id);
}
