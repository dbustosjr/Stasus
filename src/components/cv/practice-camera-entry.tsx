import Link from "next/link";
import {
  cvModeCopy,
  resolveCvTrackMode,
} from "@/lib/cv/track-mode";
import type { ExerciseCategory } from "@/lib/exercises/types";

type PracticeCameraEntryProps = {
  exerciseId: string;
  category: ExerciseCategory;
  title: string;
};

/** CTA on the exercise detail page — camera opens on a dedicated practice screen. */
export function PracticeCameraEntry({
  exerciseId,
  category,
  title,
}: PracticeCameraEntryProps) {
  const mode =
    resolveCvTrackMode(category, title) ??
    (category === "balance_training" ? "pose_balance" : "face_presence");
  const copy = cvModeCopy(mode);

  return (
    <div className="rounded-2xl border border-[var(--stasus-border)] bg-[var(--stasus-surface)] px-5 py-5">
      <p className="text-sm text-[var(--stasus-ink-muted)]">{copy}</p>
      <p className="mt-2 text-sm text-[var(--stasus-ink-muted)]">
        Opens a wider camera view on its own page so you have more room to move
        while staying in frame.
      </p>
      <Link
        href={`/app/exercises/${exerciseId}/practice`}
        className="mt-4 inline-flex h-11 w-fit items-center justify-center rounded-full bg-[var(--stasus-teal)] px-5 text-sm font-semibold text-white transition-transform active:scale-[0.98] dark:bg-[var(--stasus-aqua)] dark:text-[#001219]"
      >
        Practice with camera
      </Link>
    </div>
  );
}
