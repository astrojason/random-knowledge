import type { Lesson } from "./types";

export interface StoredLesson extends Omit<Lesson, "paragraphSources"> {
  paragraphSources?: { refs: number[] }[];
}

/** Firestore rejects arrays that directly contain other arrays, so paragraphSources (number[][]) is wrapped per-entry for storage. */
export function toFirestoreLesson(lesson: Lesson): StoredLesson {
  return {
    ...lesson,
    paragraphSources: lesson.paragraphSources?.map((refs) => ({ refs })),
  };
}

export function fromFirestoreLesson(data: StoredLesson): Lesson {
  return {
    ...data,
    paragraphSources: data.paragraphSources?.map((entry) => entry.refs),
  };
}
