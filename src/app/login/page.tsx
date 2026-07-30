import { SiteHeader } from "@/components/site-header";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-full flex-col bg-[var(--stasus-bg)]">
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-12 outline-none"
      >
        <h1 className="text-3xl font-bold tracking-tight text-[var(--stasus-ink)]">
          Sign in
        </h1>
        <p className="mt-2 mb-8 text-[var(--stasus-ink-muted)]">
          Welcome back. Your symptom data stays private to your account.
        </p>
        <AuthForm mode="signin" />
      </main>
    </div>
  );
}
