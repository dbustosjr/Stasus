import { SiteHeader } from "@/components/site-header";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-full flex-col bg-[var(--stasus-bg)]">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--stasus-ink)]">
          Reset password
        </h1>
        <p className="mt-2 mb-8 text-[var(--stasus-ink-muted)]">
          Use the email on your Stasus account to get a reset code.
        </p>
        <ForgotPasswordForm />
      </main>
    </div>
  );
}
