import { describe, expect, it } from "vitest";
import { buildLessonSpeechText } from "./speech";
import type { Lesson } from "./types";

const lesson: Lesson = {
  category: "nature",
  title: "How glaciers carve valleys",
  body: ["Glaciers move slowly downhill.", "They grind rock into fine sediment."],
  wikiQuery: "glaciers",
  youtubeQuery: "glaciers",
  quiz: [],
};

describe("buildLessonSpeechText", () => {
  it("reads the title before the body paragraphs, in order", () => {
    const text = buildLessonSpeechText(lesson);
    const titleIndex = text.indexOf(lesson.title);
    const firstParagraphIndex = text.indexOf(lesson.body[0]);
    const secondParagraphIndex = text.indexOf(lesson.body[1]);
    expect(titleIndex).toBeGreaterThanOrEqual(0);
    expect(firstParagraphIndex).toBeGreaterThan(titleIndex);
    expect(secondParagraphIndex).toBeGreaterThan(firstParagraphIndex);
  });

  it("omits citation source lists from the spoken text", () => {
    const withSources: Lesson = { ...lesson, sources: [{ title: "Source A", url: "https://example.com" }], paragraphSources: [[1]] };
    expect(buildLessonSpeechText(withSources)).not.toContain("Source A");
  });
});
