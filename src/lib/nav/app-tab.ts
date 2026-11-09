import type { AppTabKey } from "@/components/app-tab-bar";

function stripBase(pathname: string): { root: "/app" | "/demo"; rest: string } {
  if (pathname === "/demo" || pathname.startsWith("/demo/")) {
    return { root: "/demo", rest: pathname.slice("/demo".length) || "/" };
  }
  if (pathname === "/app" || pathname.startsWith("/app/")) {
    return { root: "/app", rest: pathname.slice("/app".length) || "/" };
  }
  return { root: "/app", rest: pathname };
}

/** Map a pathname under /app or /demo to the primary tab. */
export function appTabFromPathname(pathname: string): AppTabKey {
  const { rest } = stripBase(pathname);
  if (rest.startsWith("/exercises")) return "exercises";
  if (rest.startsWith("/tracker")) return "tracker";
  if (rest.startsWith("/calm")) return "calm";
  if (rest.startsWith("/insights")) return "insights";
  return "home";
}

export function isAppChromePath(pathname: string): boolean {
  if (pathname.startsWith("/app/onboarding")) return false;
  if (pathname === "/app" || pathname.startsWith("/app/")) return true;
  if (pathname === "/demo" || pathname.startsWith("/demo/")) return true;
  return false;
}

export function appBasePathFromPathname(pathname: string): "/app" | "/demo" {
  return stripBase(pathname).root;
}
