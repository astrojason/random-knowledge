import { DeepLinks } from "@/components/lesson/DeepLinks";
import { LessonBody } from "@/components/lesson/LessonBody";
import { ShareLessonButton } from "@/components/share/ShareButton";
import type { Lesson } from "@/lib/types";

export function LessonView({ lesson, date, onStartQuiz }: { lesson: Lesson; date: string; onStartQuiz: () => void }) {
  return (
    <div>
      <LessonBody lesson={lesson} />
      <DeepLinks lesson={lesson} />
      <div className="mb-4"><ShareLessonButton lesson={lesson} date={date} /></div>
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
