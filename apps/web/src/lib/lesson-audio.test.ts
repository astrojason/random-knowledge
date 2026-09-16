import { beforeEach, expect, it, vi } from "vitest";
import { attachLessonAudio } from "./lesson-audio";
import { uploadLessonAudioAdmin } from "./firebase-admin";
import { synthesizeSpeech } from "./elevenlabs";
import type { Lesson } from "./types";

vi.mock("./firebase-admin", () => ({ uploadLessonAudioAdmin: vi.fn() }));
vi.mock("./elevenlabs", () => ({ synthesizeSpeech: vi.fn() }));

const lesson: Lesson = {
  category: "nature", title: "How glaciers carve valleys",
  body: ["Glaciers move slowly downhill."], wikiQuery: "glaciers", youtubeQuery: "glaciers", quiz: [],
};

beforeEach(() => {
  vi.resetAllMocks();
});

it("synthesizes the lesson text, uploads it, and attaches the resulting URL", async () => {
  const audio = new Uint8Array([1, 2, 3]);
  vi.mocked(synthesizeSpeech).mockResolvedValue(audio);
  vi.mocked(uploadLessonAudioAdmin).mockResolvedValue("https://storage.example/lesson.mp3");

  const result = await attachLessonAudio("lesson-audio/alice/2026-09-15.mp3", lesson);

  expect(synthesizeSpeech).toHaveBeenCalledWith("How glaciers carve valleys. Glaciers move slowly downhill.");
  expect(uploadLessonAudioAdmin).toHaveBeenCalledWith("lesson-audio/alice/2026-09-15.mp3", audio);
  expect(result).toEqual({ ...lesson, audioUrl: "https://storage.example/lesson.mp3" });
});

it("logs the error and returns the lesson unchanged when synthesis fails", async () => {
  vi.mocked(synthesizeSpeech).mockRejectedValue(new Error("ElevenLabs is not configured"));
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  const result = await attachLessonAudio("lesson-audio/alice/2026-09-15.mp3", lesson);

  expect(result).toEqual(lesson);
  expect(uploadLessonAudioAdmin).not.toHaveBeenCalled();
  expect(errorSpy).toHaveBeenCalled();
});

it("logs the error and returns the lesson unchanged when the upload fails", async () => {
  vi.mocked(synthesizeSpeech).mockResolvedValue(new Uint8Array([1]));
  vi.mocked(uploadLessonAudioAdmin).mockRejectedValue(new Error("permission denied"));
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  const result = await attachLessonAudio("lesson-audio/alice/2026-09-15.mp3", lesson);

  expect(result).toEqual(lesson);
  expect(errorSpy).toHaveBeenCalled();
});
