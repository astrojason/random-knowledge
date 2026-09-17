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
  /** Absent on lessons saved before source-backed generation. */
  sources?: LessonSource[];
  /** One-based source references for each body paragraph. */
  paragraphSources?: number[][];
  /** Cloned-voice narration of the lesson. Absent if synthesis failed or hasn't run yet. */
  audioUrl?: string;
}

export interface LessonSource {
  title: string;
  url: string;
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

/** One row in the admin-visible log of lesson generations (src/lib/firebase-admin.ts's logGenerationAdmin). */
export interface GenerationLogEntry {
  uid: string;
  title: string;
  createdAt: string;
}

/** One user's outcome within a daily-lesson cron run (src/app/api/cron/generate-daily-lesson/route.ts). */
export interface CronRunResult {
  uid: string;
  status: "generated" | "already-had-lesson" | "failed";
  error?: string;
}

/** One row in the admin-visible log of daily-lesson cron runs (src/lib/firebase-admin.ts's logCronRunAdmin). */
export interface CronRunLogEntry {
  date: string;
  createdAt: string;
  stoppedForTokenLimit: boolean;
  results: CronRunResult[];
}
