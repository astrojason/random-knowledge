import { describe, expect, it } from "vitest";
import { advanceQuiz, initialQuizState, selectAnswer } from "./quiz";

describe("selectAnswer", () => {
  it("records the selection, increments correct when right, and stores it in answers", () => {
    const next = selectAnswer(initialQuizState, 2, 2);
    expect(next).toEqual({ qIndex: 0, correct: 1, selected: 2, answers: [2] });
  });

  it("does not increment correct when wrong, but still records the answer", () => {
    const next = selectAnswer(initialQuizState, 1, 2);
    expect(next).toEqual({ qIndex: 0, correct: 0, selected: 1, answers: [1] });
  });

  it("is a no-op once a question is already answered", () => {
    const answered = { qIndex: 0, correct: 1, selected: 2, answers: [2] };
    expect(selectAnswer(answered, 0, 2)).toBe(answered);
  });

  it("records answers at the current question's index, leaving earlier ones intact", () => {
    const midQuiz = { qIndex: 1, correct: 1, selected: null, answers: [2] };
    const next = selectAnswer(midQuiz, 0, 0);
    expect(next.answers).toEqual([2, 0]);
  });
});

describe("advanceQuiz", () => {
  it("moves to the next question and clears the selection", () => {
    const quiz = { qIndex: 0, correct: 1, selected: 2, answers: [2] };
    expect(advanceQuiz(quiz, 3)).toEqual({ qIndex: 1, correct: 1, selected: null, answers: [2] });
  });

  it("reports completion once the last question has been answered", () => {
    const quiz = { qIndex: 2, correct: 3, selected: 1, answers: [2, 0, 1] };
    expect(advanceQuiz(quiz, 3)).toBe("complete");
  });
});
