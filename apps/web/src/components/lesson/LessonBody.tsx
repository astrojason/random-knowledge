import type { Lesson } from "@/lib/types";

export function LessonBody({ lesson }: { lesson: Lesson }) {
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
    </div>
  );
}
