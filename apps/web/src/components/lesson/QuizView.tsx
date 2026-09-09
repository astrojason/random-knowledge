import type { Lesson } from "@/lib/types";

interface QuizState {
  qIndex: number;
  correct: number;
  selected: number | null;
}

export function QuizView({
  lesson,
  quiz,
  onSelect,
  onNext,
}: {
  lesson: Lesson;
  quiz: QuizState;
  onSelect: (index: number) => void;
  onNext: () => void;
}) {
  const q = lesson.quiz[quiz.qIndex];
  const answered = quiz.selected !== null;

  return (
    <div>
      <div className="mb-1.5 text-xs text-fg-muted">
        Question {quiz.qIndex + 1} of {lesson.quiz.length}
      </div>
      <p className="mb-3.5 font-heading text-[17px] font-semibold text-fg-strong">{q.question}</p>
      <div className="mb-1">
        {q.options.map((option, i) => {
          const isCorrect = i === q.correctIndex;
          const isSelected = i === quiz.selected;
          const state = !answered ? "idle" : isCorrect ? "correct" : isSelected ? "incorrect" : "idle";
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => onSelect(i)}
              className={
                "mb-2 block w-full rounded-sm border px-3.5 py-3 text-left text-[14.5px] transition-colors " +
                (state === "correct"
                  ? "border-accent bg-correct"
                  : state === "incorrect"
                    ? "border-rust bg-incorrect"
                    : "border-border bg-surface-raised hover:border-rust cursor-pointer")
              }
            >
              {option}
            </button>
          );
        })}
      </div>
      {answered && (
        <>
          <p className="mt-2.5 text-[13.5px] italic leading-relaxed text-fg-muted">{q.explanation}</p>
          <button
            type="button"
            onClick={onNext}
            className="mt-5 rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-85"
          >
            Continue
          </button>
        </>
      )}
    </div>
  );
}
