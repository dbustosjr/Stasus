import type { AppTabKey } from "@/components/app-tab-bar";

/** Map a pathname under /app to the primary tab. */
export function appTabFromPathname(pathname: string): AppTabKey {
  if (pathname.startsWith("/app/exercises")) return "exercises";
  if (pathname.startsWith("/app/tracker")) return "tracker";
  if (pathname.startsWith("/app/calm")) return "calm";
  if (pathname.startsWith("/app/insights")) return "insights";
  return "home";
}

export function isAppChromePath(pathname: string): boolean {
  if (!pathname.startsWith("/app")) return false;
  if (pathname.startsWith("/app/onboarding")) return false;
  return true;
}
