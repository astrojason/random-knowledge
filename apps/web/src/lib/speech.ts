import { plainMath } from "./math";
import type { Lesson } from "./types";

/** Plain text for text-to-speech playback: title plus body paragraphs, no citation markers or source list. */
export function buildLessonSpeechText(lesson: Lesson): string {
  return [lesson.title, ...lesson.body.map(plainMath)].join(". ");
}
