import type { CategoryKey } from "./categories";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GeneratedLesson {
  title: string;
  body: string[];
  wikiQuery: string;
  youtubeQuery: string;
  quiz: QuizQuestion[];
}

export interface Lesson extends GeneratedLesson {
  category: CategoryKey;
}

export interface StreakData {
  streak: number;
  longest: number;
  lastDate: string | null;
}

export interface HistoryEntry {
  date: string;
  category: CategoryKey;
  title: string;
}

export interface DailyProgress {
  done: boolean;
  correct: number;
  total: number;
  /** Selected option index per question, in question order. Absent on progress saved before this field existed. */
  answers?: number[];
}
