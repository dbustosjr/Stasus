import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { SiteHeader } from "@/components/site-header";
import { OnboardingForm } from "@/components/onboarding-form";

export default async function OnboardingPage() {
  const { insforge, user } = await requireUser();

  const { data: profile } = await insforge.database
    .from("profiles")
    .select("onboarding_complete")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarding_complete) {
    redirect("/app");
  }

  return (
    <div className="relative flex min-h-full flex-col bg-[var(--stasus-bg)]">
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12 outline-none"
      >
        <div>
          <p className="text-sm font-medium text-[var(--stasus-ink-muted)]">
            Welcome{user.email ? `, ${user.email}` : ""}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--stasus-ink)]">
            Let’s start with what you’re noticing
          </h1>
          <p className="mt-2 text-[var(--stasus-ink-muted)]">
            Symptom-first, optional labels, no required diagnosis.
          </p>
        </div>
        <OnboardingForm />
      </main>
    </div>
  );
}
