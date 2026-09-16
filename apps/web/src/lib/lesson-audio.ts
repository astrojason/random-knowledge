import { synthesizeSpeech } from "@/lib/elevenlabs";
import { uploadLessonAudioAdmin } from "@/lib/firebase-admin";
import { buildLessonSpeechText } from "@/lib/speech";
import type { Lesson } from "@/lib/types";

/**
 * Synthesizes narration for `lesson` and attaches it as `audioUrl`. Narration is supplementary —
 * the text lesson is already valid without it — so a failure here is logged and the lesson is
 * returned unchanged rather than failing the whole generation.
 */
export async function attachLessonAudio(path: string, lesson: Lesson): Promise<Lesson> {
  try {
    const audio = await synthesizeSpeech(buildLessonSpeechText(lesson));
    const audioUrl = await uploadLessonAudioAdmin(path, audio);
    return { ...lesson, audioUrl };
  } catch (err) {
    console.error(`Failed to generate lesson audio (${path})`, err);
    return lesson;
  }
}
