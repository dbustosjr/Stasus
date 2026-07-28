"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthActions } from "@insforge/sdk/ssr";
import { createInsForgeServerClient } from "@/lib/insforge/server";

export type AuthFormState = {
  error: string | null;
};

async function ensureProfile(userId: string) {
  const insforge = await createInsForgeServerClient();
  const { data: existing, error: readError } = await insforge.database
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (readError) {
    return { error: readError.message };
  }

  if (existing) {
    return { error: null };
  }

  const { error: insertError } = await insforge.database
    .from("profiles")
    .insert([{ id: userId }]);

  if (insertError) {
    return { error: insertError.message };
  }

  return { error: null };
}

export async function signUp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const auth = createAuthActions({ cookies: await cookies() });
  const { data, error } = await auth.signUp({ email, password });

  if (error || !data?.user) {
    return { error: error?.message ?? "Could not create account." };
  }

  const profile = await ensureProfile(data.user.id);
  if (profile.error) {
    return { error: profile.error };
  }

  redirect("/app");
}

export async function signIn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const auth = createAuthActions({ cookies: await cookies() });
  const { data, error } = await auth.signInWithPassword({ email, password });

  if (error || !data?.user) {
    return { error: error?.message ?? "Invalid email or password." };
  }

  const profile = await ensureProfile(data.user.id);
  if (profile.error) {
    return { error: profile.error };
  }

  redirect("/app");
}

export async function signOut() {
  const auth = createAuthActions({ cookies: await cookies() });
  await auth.signOut();
  redirect("/");
}
