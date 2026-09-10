import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DailyLesson } from "./DailyLesson";
import { CategoryPicker } from "./CategoryPicker";
import { QuizView } from "./QuizView";
import { QuizReview } from "./QuizReview";
import { DeepLinks } from "./DeepLinks";
import { useDailyLesson } from "@/lib/useDailyLesson";
import type { Lesson } from "@/lib/types";

vi.mock("@/lib/useDailyLesson", () => ({ useDailyLesson: vi.fn() }));
vi.mock("@/lib/auth-context", () => ({ useAuth: () => ({ user: null, claims: null, signOut: vi.fn() }) }));

const lesson: Lesson = {
  category: "nature", title: "A test lesson", body: ["First paragraph", "Second paragraph", "Third paragraph"],
  wikiQuery: "nature & science", youtubeQuery: "nature video",
  quiz: [{ question: "Which answer?", options: ["Alpha", "Beta", "Gamma", "Delta"], correctIndex: 0, explanation: "Alpha is correct." }],
};
const noop = () => {};

function state(phase: ReturnType<typeof useDailyLesson>["phase"]): ReturnType<typeof useDailyLesson> {
  return {
    phase, date: "2026-09-10", lesson, streak: { streak: 1, longest: 1, lastDate: null },
    weights: {} as ReturnType<typeof useDailyLesson>["weights"], selectedCategories: ["nature"],
    progress: { done: true, correct: 1, total: 1, answers: [0] },
    quiz: { qIndex: 0, correct: 0, selected: null, answers: [] }, errorMessage: "Test error", categoryKeys: ["nature"],
    actions: { retry: vi.fn(), startQuiz: noop, selectOption: noop, nextQuestion: vi.fn(), adjustWeight: vi.fn(), resetAll: vi.fn(), saveCategories: vi.fn() },
  };
}

beforeEach(() => vi.clearAllMocks());

describe("daily lesson phases", () => {
  it.each([
    ["loading", "Setting things up"], ["generating", "Researching and checking"], ["categories", "What would you like to learn?"],
    ["error", "Test error"], ["lesson", "A test lesson"], ["quiz", "Which answer?"], ["done", "1 of 1 today"],
  ] as const)("renders %s", (phase, text) => {
    vi.mocked(useDailyLesson).mockReturnValue(state(phase));
    const html = renderToStaticMarkup(createElement(DailyLesson));
    expect(html).toContain(text);
    expect(html.includes("My categories")).toBe(["lesson", "quiz", "done"].includes(phase));
  });

  it("does not show completed results without saved progress", () => {
    vi.mocked(useDailyLesson).mockReturnValue({ ...state("done"), progress: null });
    expect(renderToStaticMarkup(createElement(DailyLesson))).not.toContain("of 1 today");
  });
});

describe("quiz feedback", () => {
  it.each([null, 0, 1])("reveals feedback only after an answer (%s)", (selected) => {
    const html = renderToStaticMarkup(createElement(QuizView, { lesson, quiz: { qIndex: 0, correct: 0, selected }, onSelect: noop, onNext: noop }));
    expect(html.includes("Alpha is correct.")).toBe(selected !== null);
    expect(html.includes("bg-correct")).toBe(selected !== null);
    expect(html.includes("bg-incorrect")).toBe(selected === 1);
    expect(html.includes("disabled")).toBe(selected !== null);
  });

  it("marks the correct and selected incorrect answers in review", () => {
    const html = renderToStaticMarkup(createElement(QuizReview, { lesson, answers: [1] }));
    expect(html).toContain("bg-correct");
    expect(html).toContain("bg-incorrect");
    expect(html).toContain("Alpha is correct.");
  });
});

it("disables category submission until a category is selected", () => {
  const html = renderToStaticMarkup(createElement(CategoryPicker, { selectedCategories: [], onSave: vi.fn() }));
  expect(html).toContain('type="submit" disabled');
  expect(html).toContain("Choose at least one category to continue.");
});

it("shows edit-specific category instructions and cancel", () => {
  const html = renderToStaticMarkup(createElement(CategoryPicker, { selectedCategories: ["nature"], onSave: vi.fn(), onCancel: noop }));
  expect(html).toContain("Changes apply to future lessons");
  expect(html).toContain("Save categories");
  expect(html).toContain("Cancel");
});

it("encodes deep links and omits missing search queries", () => {
  const html = renderToStaticMarkup(createElement(DeepLinks, { lesson }));
  expect(html).toContain("nature%20%26%20science");
  expect(renderToStaticMarkup(createElement(DeepLinks, { lesson: { ...lesson, wikiQuery: "", youtubeQuery: "" } }))).toBe("");
});
