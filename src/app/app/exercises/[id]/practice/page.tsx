import Link from "next/link";
import { notFound } from "next/navigation";
import { PracticeCoach } from "@/components/cv/practice-coach";
import { requireOnboarded } from "@/lib/auth/require-onboarded";
import type { ExerciseCategory } from "@/lib/exercises/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ExerciseCameraPracticePage({
  params,
}: PageProps) {
  const { id } = await params;
  const { insforge, user } = await requireOnboarded();

  const { data, error } = await insforge.database
    .from("exercises")
    .select("id, category, title, requires_cv_tracking")
    .eq("id", id)
    .maybeSingle();

  if (error || !data || !data.requires_cv_tracking) {
    notFound();
  }

  const exerciseId = String(data.id);
  const title = String(data.title);
  const category = data.category as ExerciseCategory;
  const backHref = `/app/exercises/${exerciseId}`;

  return (
    <>
      <div>
        <Link
          href={backHref}
          className="text-sm font-medium text-[var(--stasus-ink-muted)] hover:text-[var(--stasus-ink)]"
        >
          ← Back to {title}
        </Link>
        <h1 className="mt-4 font-display text-3xl font-medium tracking-tight text-[var(--stasus-ink)] sm:text-4xl">
          Camera practice
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--stasus-ink-muted)]">
          {title}. Give yourself a little more space from the screen so the
          camera can see you clearly. Video stays on this device.
        </p>
      </div>

      <PracticeCoach
        exerciseId={exerciseId}
        category={category}
        title={title}
        variant="page"
        backHref={backHref}
      />
    </>
  );
}
