/** Build paths under the isolated `/demo` tree. */
export function demoPath(suffix = ""): string {
  if (!suffix || suffix === "/") return "/demo";
  const cleaned = suffix.startsWith("/") ? suffix : `/${suffix}`;
  return `/demo${cleaned}`;
}
