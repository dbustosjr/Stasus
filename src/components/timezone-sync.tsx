"use client";

import { useEffect, useRef } from "react";
import { upsertTimezone } from "@/app/actions/activity";

/** Syncs browser IANA timezone into profiles.timezone once per mount. */
export function TimezoneSync() {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) void upsertTimezone(tz);
    } catch {
      // ignore
    }
  }, []);

  return null;
}
