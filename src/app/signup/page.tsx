import { SiteHeader } from "@/components/site-header";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <div className="relative flex min-h-full flex-col bg-[var(--stasus-bg)]">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--stasus-ink)]">
          Create your account
        </h1>
        <p className="mt-2 mb-8 text-[var(--stasus-ink-muted)]">
          Start with email. Diagnosis labels are optional later — never required.
        </p>
        <AuthForm mode="signup" />
      </main>
    </div>
  );
}
