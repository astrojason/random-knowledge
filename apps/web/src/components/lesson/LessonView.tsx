import { DeepLinks } from "@/components/lesson/DeepLinks";
import type { Lesson } from "@/lib/types";

export function LessonView({ lesson, onStartQuiz }: { lesson: Lesson; onStartQuiz: () => void }) {
  return (
    <div>
      <h1 className="mb-4 max-w-[34ch] font-heading text-[26px] font-bold leading-snug text-fg-strong">
        {lesson.title}
      </h1>
      <div className="mb-1 max-w-[62ch] font-heading text-[16.5px] leading-relaxed text-fg">
        {lesson.body.map((paragraph, i) => (
          <p key={i} className="mb-3.5">
            {paragraph}
          </p>
        ))}
      </div>
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
