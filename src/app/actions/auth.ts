"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthActions } from "@insforge/sdk/ssr";
import { createInsForgeServerClient } from "@/lib/insforge/server";

export type AuthFormState = {
  error: string | null;
  needsVerification?: boolean;
  email?: string | null;
  info?: string | null;
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
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const auth = createAuthActions({ cookies: await cookies() });
  const { data, error } = await auth.signUp({ email, password });

  if (error) {
    return { error: error.message ?? "Could not create account." };
  }

  if (data?.requireEmailVerification) {
    return {
      error: null,
      needsVerification: true,
      email,
      info: "We sent a 6-digit code to your email. Enter it below to finish signup.",
    };
  }

  if (!data?.user) {
    return { error: "Could not create account." };
  }

  const profile = await ensureProfile(data.user.id);
  if (profile.error) {
    return { error: profile.error };
  }

  redirect("/app");
}

export async function verifySignupEmail(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const otp = String(formData.get("otp") ?? "").trim();

  if (!email || !otp) {
    return {
      error: "Email and verification code are required.",
      needsVerification: true,
      email,
    };
  }

  const auth = createAuthActions({ cookies: await cookies() });
  const { data, error } = await auth.verifyEmail({ email, otp });

  if (error || !data?.user) {
    return {
      error: error?.message ?? "Invalid or expired code.",
      needsVerification: true,
      email,
    };
  }

  const profile = await ensureProfile(data.user.id);
  if (profile.error) {
    return {
      error: profile.error,
      needsVerification: true,
      email,
    };
  }

  redirect("/app");
}

export async function resendSignupCode(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    return {
      error: "Email is required to resend a code.",
      needsVerification: true,
    };
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://127.0.0.1:3000";
  const insforge = await createInsForgeServerClient();
  const { error } = await insforge.auth.resendVerificationEmail({
    email,
    redirectTo: `${appUrl}/login`,
  });

  if (error) {
    return {
      error: error.message ?? "Could not resend verification email.",
      needsVerification: true,
      email,
    };
  }

  return {
    error: null,
    needsVerification: true,
    email,
    info: "A new code was sent if that email still needs verification.",
  };
}

export async function signIn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const auth = createAuthActions({ cookies: await cookies() });
  const { data, error } = await auth.signInWithPassword({ email, password });

  if (error || !data?.user) {
    const message = error?.message ?? "Invalid email or password.";
    const needsVerification =
      /verif/i.test(message) || /confirm/i.test(message);
    return {
      error: message,
      needsVerification: needsVerification || undefined,
      email: needsVerification ? email : undefined,
      info: needsVerification
        ? "Enter the code from your email, or resend a new one."
        : undefined,
    };
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

export type ResetPasswordState = {
  error: string | null;
  info?: string | null;
  email?: string | null;
  step?: "request" | "reset" | "done";
};

export async function requestPasswordReset(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    return { error: "Email is required.", step: "request" };
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://127.0.0.1:3000";
  const insforge = await createInsForgeServerClient();
  const { error } = await insforge.auth.sendResetPasswordEmail({
    email,
    redirectTo: `${appUrl}/forgot-password`,
  });

  if (error) {
    return {
      error: error.message ?? "Could not send reset email.",
      step: "request",
      email,
    };
  }

  // Generic success (avoid confirming whether the email exists).
  return {
    error: null,
    step: "reset",
    email,
    info: "If an account exists for that email, we sent a 6-digit reset code. Enter it below with your new password.",
  };
}

export async function confirmPasswordReset(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").trim();
  const newPassword = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!email || !code) {
    return {
      error: "Email and reset code are required.",
      step: "reset",
      email,
    };
  }
  if (newPassword.length < 8) {
    return {
      error: "Password must be at least 8 characters.",
      step: "reset",
      email,
    };
  }
  if (newPassword !== confirmPassword) {
    return {
      error: "Passwords do not match.",
      step: "reset",
      email,
    };
  }

  const insforge = await createInsForgeServerClient();
  const { data: exchanged, error: exchangeError } =
    await insforge.auth.exchangeResetPasswordToken({ email, code });

  if (exchangeError || !exchanged?.token) {
    return {
      error: exchangeError?.message ?? "Invalid or expired reset code.",
      step: "reset",
      email,
    };
  }

  const { error: resetError } = await insforge.auth.resetPassword({
    newPassword,
    otp: exchanged.token,
  });

  if (resetError) {
    return {
      error: resetError.message ?? "Could not reset password.",
      step: "reset",
      email,
    };
  }

  return {
    error: null,
    step: "done",
    email,
    info: "Password updated. You can sign in with your new password.",
  };
}
