export interface QuizState {
  qIndex: number;
  correct: number;
  selected: number | null;
  answers: number[];
}

export const initialQuizState: QuizState = { qIndex: 0, correct: 0, selected: null, answers: [] };

export function selectAnswer(quiz: QuizState, index: number, correctIndex: number): QuizState {
  if (quiz.selected !== null) return quiz;
  const answers = [...quiz.answers];
  answers[quiz.qIndex] = index;
  return { ...quiz, selected: index, correct: quiz.correct + (index === correctIndex ? 1 : 0), answers };
}

export function advanceQuiz(quiz: QuizState, questionCount: number): QuizState | "complete" {
  const nextIndex = quiz.qIndex + 1;
  if (nextIndex < questionCount) {
    return { qIndex: nextIndex, correct: quiz.correct, selected: null, answers: quiz.answers };
  }
  return "complete";
}
