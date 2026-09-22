import { DONT_REMEMBER } from "@/lib/quiz";
import type { Lesson } from "@/lib/types";

export function QuizReview({ lesson, answers }: { lesson: Lesson; answers: number[] }) {
  return (
    <div className="mt-6 border-t border-border pt-5">
      <h2 className="mb-4 font-heading text-[15px] font-semibold text-fg-strong">Your answers</h2>
      <div className="flex flex-col gap-5">
        {lesson.quiz.map((q, qIndex) => {
          const selected = answers[qIndex];
          return (
            <div key={qIndex}>
              <p className="mb-2 text-[13px] text-fg-muted">Question {qIndex + 1}</p>
              <p className="mb-2.5 text-[14.5px] font-medium text-fg-strong">{q.question}</p>
              <div className="mb-1">
                {q.options.map((option, i) => {
                  const isCorrect = i === q.correctIndex;
                  const isSelected = i === selected;
                  const state = isCorrect ? "correct" : isSelected ? "incorrect" : "idle";
                  return (
                    <div
                      key={i}
                      className={
                        "mb-2 rounded-sm border px-3.5 py-3 text-left text-[14.5px] " +
                        (state === "correct"
                          ? "border-accent bg-correct"
                          : state === "incorrect"
                            ? "border-rust bg-incorrect"
                            : "border-border bg-surface-raised")
                      }
                    >
                      {option}
                    </div>
                  );
                })}
              </div>
              {selected === DONT_REMEMBER && (
                <p className="mb-2 text-[13px] text-fg-muted">You said you didn&apos;t remember.</p>
              )}
              <p className="text-[13.5px] italic leading-relaxed text-fg-muted">{q.explanation}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
