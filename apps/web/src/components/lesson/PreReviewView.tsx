import type { Lesson } from "@/lib/types";

export function PreReviewView({
  lesson,
  preReview,
  onAnswer,
  onSkip,
}: {
  lesson: Lesson;
  preReview: { qIndex: number };
  onAnswer: () => void;
  onSkip: () => void;
}) {
  const questions = lesson.preQuiz ?? [];
  const q = questions[preReview.qIndex];
  if (!q) return null;

  return (
    <div>
      <p className="mb-4 text-[13.5px] italic leading-relaxed text-fg-muted">
        Even a wrong guess gets you thinking before you find the answer.
      </p>
      <div className="mb-1.5 text-xs text-fg-muted">
        Question {preReview.qIndex + 1} of {questions.length}
      </div>
      <p className="mb-3.5 font-heading text-[17px] font-semibold text-fg-strong">{q.question}</p>
      <div className="mb-1">
        {q.options.map((option, i) => (
          <button
            key={i}
            type="button"
            onClick={onAnswer}
            className="mb-2 block w-full cursor-pointer rounded-sm border border-border bg-surface-raised px-3.5 py-3 text-left text-[14.5px] transition-colors hover:border-rust"
          >
            {option}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="cursor-pointer text-[13px] text-fg-muted underline decoration-dotted underline-offset-2 hover:text-fg"
      >
        Skip to the lesson
      </button>
    </div>
  );
}
