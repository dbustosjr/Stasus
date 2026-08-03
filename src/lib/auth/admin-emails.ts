/** Emails allowed for Personal Admin (comma-separated ADMIN_EMAILS). */
export function adminEmailSet(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const signedIn = (email ?? "").trim().toLowerCase();
  if (!signedIn) return false;
  const allow = adminEmailSet();
  return allow.size > 0 && allow.has(signedIn);
}
