import { DeepLinks } from "@/components/lesson/DeepLinks";
import { LessonBody } from "@/components/lesson/LessonBody";
import type { Lesson } from "@/lib/types";

export function LessonView({ lesson, onStartQuiz }: { lesson: Lesson; onStartQuiz: () => void }) {
  return (
    <div>
      <LessonBody lesson={lesson} />
      <DeepLinks lesson={lesson} />
      <button
        type="button"
        onClick={onStartQuiz}
        className="rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-85"
      >
        Take the quick check
      </button>
    </div>
  );
}
