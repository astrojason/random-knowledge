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
  /** Simpler guess-first questions (3 options each) shown before the lesson when the reader turns pre-review on. Absent on older lessons. */
  preQuiz?: QuizQuestion[];
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

/** An Expo push token registered by the mobile app, so the server can badge the app icon without it being open. */
export interface PushToken {
  token: string;
  platform: "ios" | "android";
  updatedAt: string;
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
/** What triggered a generation: the nightly cron ("auto") or the user opening the app ("on-access"). */
export type GenerationSource = "auto" | "on-access";

export interface GenerationLogEntry {
  uid: string;
  title: string;
  createdAt: string;
  /** Absent on entries logged before the source was recorded. */
  source?: GenerationSource;
}

/** One user's outcome within a daily-lesson cron run (src/app/api/cron/generate-daily-lesson/route.ts). */
export interface CronRunResult {
  uid: string;
  status: "generated" | "already-had-lesson" | "auto-generation-off" | "failed";
  error?: string;
}

/** One row in the admin-visible log of daily-lesson cron runs (src/lib/firebase-admin.ts's logCronRunAdmin). */
export interface CronRunLogEntry {
  date: string;
  createdAt: string;
  stoppedForTokenLimit: boolean;
  /** Set when the run quit early for a reason other than the token limit, e.g. the token tracker being unreachable. */
  error?: string;
  results: CronRunResult[];
}

/** A public-by-link snapshot of one lesson, stored at shares/{id} so friends can read it without access to the owner's account. */
export interface SharedLesson {
  id: string;
  ownerName: string | null;
  title: string;
  category: CategoryKey;
  createdAt: string;
  lesson: Lesson;
}

/** What a signed-out or not-yet-approved visitor may see of a share: enough to make the invite interesting. */
export interface SharePreview {
  title: string;
  category: CategoryKey;
  ownerName: string | null;
}

/** A shared lesson a reader saved into their own account at users/{uid}/stash/{shareId}. */
export interface StashEntry {
  id: string;
  savedAt: string;
  sharedBy: string | null;
  title: string;
  category: CategoryKey;
  lesson: Lesson;
}
