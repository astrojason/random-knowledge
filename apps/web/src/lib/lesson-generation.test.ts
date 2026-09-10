import { describe, expect, it, vi } from "vitest";
import type OpenAI from "openai";
import { generateSourcedLesson } from "./lesson-generation";

function fixture() {
  const research = {
    status: "completed", output_text: "Research notes with supporting citations.", usage: { total_tokens: 100 },
    output: [
      { type: "web_search_call", status: "completed" },
      { type: "message", content: [{ type: "output_text", annotations: [
        { type: "url_citation", url: "https://museum.example/topic", title: "Museum" },
        { type: "url_citation", url: "https://university.example/topic", title: "University" },
      ] }] },
    ],
  };
  const draft = {
    title: "A sourced lesson", body: ["First paragraph.", "Second paragraph.", "Third paragraph."],
    wikiQuery: "topic research evidence", youtubeQuery: "topic explanation demonstration",
    paragraphSources: [[1], [2], [1, 2]],
    quiz: Array.from({ length: 3 }, () => ({ question: "What happened?", options: ["A", "B", "C", "D"], correctIndex: 0, explanation: "The lesson explains A." })),
  };
  const response = (value: unknown) => ({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(value) } }], usage: { total_tokens: 50 } });
  const search = vi.fn().mockResolvedValue(research);
  const chat = vi.fn().mockImplementationOnce(async () => response(draft)).mockResolvedValue(response({ supported: true, issues: [] }));
  const client = { responses: { create: search }, chat: { completions: { create: chat } } } as unknown as OpenAI;
  const onTokens = vi.fn().mockResolvedValue(undefined);
  const generate = () => generateSourcedLesson(client, { category: "nature", recentTitles: [], model: "writer", researchModel: "researcher", onTokens });
  return { research, draft, search, chat, onTokens, generate, response };
}

describe("source-backed lesson generation", () => {
  it("requires web research, reviews the draft, and uses tool-provided source URLs", async () => {
    const f = fixture();
    const lesson = await f.generate();
    expect(f.search).toHaveBeenCalledWith(expect.objectContaining({ tool_choice: "required", tools: [{ type: "web_search" }] }));
    expect(f.chat).toHaveBeenCalledTimes(2);
    expect(lesson.sources?.map((s) => s.url)).toEqual(["https://museum.example/topic", "https://university.example/topic"]);
    expect(f.onTokens.mock.calls.map(([count]) => count)).toEqual([100, 50, 50]);
  });

  it("rejects unsourced research without falling back to model memory", async () => {
    const f = fixture();
    f.research.output = [];
    await expect(f.generate()).rejects.toThrow(/sources/i);
    expect(f.chat).not.toHaveBeenCalled();
  });

  it("rejects invented source references", async () => {
    const f = fixture();
    f.draft.paragraphSources[0] = [999];
    await expect(f.generate()).rejects.toThrow(/source/i);
    expect(f.chat).toHaveBeenCalledTimes(1);
  });

  it("rejects a paragraph with no supporting reference", async () => {
    const f = fixture();
    f.draft.paragraphSources[1] = [];
    await expect(f.generate()).rejects.toThrow(/source/i);
  });

  it("rejects malformed quizzes", async () => {
    const f = fixture();
    f.draft.quiz[0].correctIndex = 4;
    await expect(f.generate()).rejects.toThrow(/quiz/i);
  });

  it("blocks a draft flagged by review and still accounts for its tokens", async () => {
    const f = fixture();
    f.chat.mockResolvedValue(f.response({ supported: false, issues: ["Invented anecdote"] }));
    await expect(f.generate()).rejects.toThrow(/source review/i);
    expect(f.onTokens).toHaveBeenCalledTimes(3);
  });

  it("rejects an incomplete research response", async () => {
    const f = fixture();
    f.research.status = "incomplete";
    await expect(f.generate()).rejects.toThrow(/research/i);
    expect(f.chat).not.toHaveBeenCalled();
  });

  it("rejects a malformed review instead of assuming approval", async () => {
    const f = fixture();
    f.chat.mockResolvedValue(f.response({ supported: "true" }));
    await expect(f.generate()).rejects.toThrow(/source review/i);
  });
});
