import { DeepLinks } from "@/components/lesson/DeepLinks";
import { LessonBody } from "@/components/lesson/LessonBody";
import { CATEGORIES } from "@/lib/categories";
import type { Lesson } from "@/lib/types";
import type { ReactNode } from "react";

/** A read-only lesson (past, stashed, or shared) with the actions that apply to it. */
export function SavedLesson({ lesson, byline, actions, children }: { lesson: Lesson; byline?: string; actions: ReactNode; children?: ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-xs text-fg-muted">
        <span className="mr-2 rounded-sm bg-accent-soft px-2.5 py-1 font-semibold text-accent">{CATEGORIES[lesson.category]}</span>
        {byline}
      </p>
      <LessonBody lesson={lesson} />
      <DeepLinks lesson={lesson} />
      <div className="mb-4 flex flex-wrap items-center gap-4">{actions}</div>
      {children}
    </div>
  );
}
