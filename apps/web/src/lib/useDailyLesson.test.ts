// @vitest-environment happy-dom

import { act, createElement, useLayoutEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { User } from "firebase/auth";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDailyLesson } from "./useDailyLesson";
import * as store from "./firestore";
import { defaultWeights } from "./categories";
import type { Lesson } from "./types";

vi.mock("./firestore", () => ({
  appendHistory: vi.fn(), completeDailyLesson: vi.fn(), getAccessRequest: vi.fn(), getHistory: vi.fn(), getLesson: vi.fn(),
  getPreReviewEnabled: vi.fn(), setPreReviewEnabled: vi.fn(), getProgress: vi.fn(), getSelectedCategories: vi.fn(), getStreak: vi.fn(), getWeights: vi.fn(),
  resetAllUserData: vi.fn(), setLesson: vi.fn(), setSelectedCategories: vi.fn(), setWeights: vi.fn(),
}));

const lesson: Lesson = {
  category: "nature", title: "Saved lesson", body: ["One", "Two", "Three"], wikiQuery: "nature", youtubeQuery: "nature",
  quiz: [{ question: "Choose A", options: ["A", "B", "C", "D"], correctIndex: 0, explanation: "A is right." }],
};
const user = { uid: "reader", getIdToken: vi.fn().mockResolvedValue("token") } as unknown as User;
let root: Root;
let current: ReturnType<typeof useDailyLesson>;

function Harness({ signedInUser }: { signedInUser: User | null }) {
  const state = useDailyLesson(signedInUser);
  useLayoutEffect(() => { current = state; });
  return null;
}

async function mount(signedInUser: User | null = user) {
  await act(async () => root.render(createElement(Harness, { signedInUser })));
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(lesson)));
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(user.getIdToken).mockResolvedValue("token");
  vi.mocked(store.getLesson).mockResolvedValue(lesson);
  vi.mocked(store.getStreak).mockResolvedValue({ streak: 2, longest: 4, lastDate: null });
  vi.mocked(store.getWeights).mockResolvedValue(defaultWeights());
  vi.mocked(store.getHistory).mockResolvedValue([]);
  vi.mocked(store.getAccessRequest).mockResolvedValue(null);
  vi.mocked(store.getProgress).mockResolvedValue(null);
  vi.mocked(store.getPreReviewEnabled).mockResolvedValue(false);
  vi.mocked(store.getSelectedCategories).mockResolvedValue(["nature"]);
  root = createRoot(document.createElement("div"));
});

afterEach(async () => {
  await act(async () => root.unmount());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("loading a daily lesson", () => {
  it("waits for a signed-in user", async () => {
    await mount(null);
    expect(store.getLesson).not.toHaveBeenCalled();
  });

  it("reuses the saved lesson and restores completed progress", async () => {
    vi.mocked(store.getProgress).mockResolvedValue({ done: true, correct: 1, total: 1, answers: [0] });
    await mount();
    expect(current.phase).toBe("done");
    expect(current.lesson).toEqual(lesson);
    expect(current.progress?.answers).toEqual([0]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("asks for categories before generating a first lesson", async () => {
    vi.mocked(store.getLesson).mockResolvedValue(null);
    vi.mocked(store.getSelectedCategories).mockResolvedValue(null);
    await mount();
    expect(current.phase).toBe("categories");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("generates and persists a missing lesson with the user's selected category", async () => {
    vi.mocked(store.getLesson).mockResolvedValue(null);
    await mount();
    expect(current.phase).toBe("lesson");
    expect(store.setLesson).toHaveBeenCalledWith(user.uid, current.date, lesson);
    expect(store.appendHistory).toHaveBeenCalledWith(user.uid, { date: current.date, category: "nature", title: lesson.title }, []);
    expect(fetch).toHaveBeenCalledWith("/api/generate-lesson", expect.objectContaining({
      headers: { "Content-Type": "application/json", Authorization: "Bearer token" },
      body: JSON.stringify({ category: "nature", recentTitles: [] }),
    }));
  });

  it("reports generation errors and allows a successful retry", async () => {
    vi.mocked(store.getLesson).mockResolvedValue(null);
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({ error: "Try later" }, { status: 502 }));
    await mount();
    expect(current.phase).toBe("error");
    expect(current.errorMessage).toBe("Try later");
    expect(store.setLesson).not.toHaveBeenCalled();
    await act(async () => current.actions.retry());
    expect(current.phase).toBe("lesson");
    expect(current.errorMessage).toBeNull();
  });

  it("uses the HTTP status when a failed response is not JSON", async () => {
    vi.mocked(store.getLesson).mockResolvedValue(null);
    vi.mocked(fetch).mockResolvedValue(new Response("Unavailable", { status: 503 }));
    await mount();
    expect(current.errorMessage).toBe("HTTP 503");
  });
});

describe("when auto generation is turned off for the user", () => {
  const pausedRequest = { uid: "reader", email: null, displayName: null, status: "granted", firstSeenAt: "2026-09-01", lastSeenAt: "2026-09-01", autoGeneration: false } as const;
  const lastLesson: Lesson = { ...lesson, title: "Last generated lesson" };

  beforeEach(() => {
    vi.mocked(store.getAccessRequest).mockResolvedValue(pausedRequest);
    vi.mocked(store.getHistory).mockResolvedValue([{ date: "2026-09-20", category: "nature", title: "Last generated lesson" }]);
    vi.mocked(store.getLesson).mockImplementation(async (_uid, date) => (date === "2026-09-20" ? lastLesson : null));
  });

  it("shows the last generated lesson as today's instead of generating a new one", async () => {
    await mount();
    expect(current.phase).toBe("lesson");
    expect(current.lesson?.title).toBe("Last generated lesson");
    expect(fetch).not.toHaveBeenCalled();
    expect(store.setLesson).not.toHaveBeenCalled();
    expect(store.appendHistory).not.toHaveBeenCalled();
  });

  it("still lets them take the quiz and records it against today", async () => {
    vi.mocked(store.completeDailyLesson).mockResolvedValue({
      streak: { streak: 3, longest: 4, lastDate: "2026-09-21" }, progress: { done: true, correct: 1, total: 1, answers: [0] },
    });
    await mount();
    await act(async () => current.actions.startQuiz());
    await act(async () => current.actions.selectOption(0));
    await act(async () => current.actions.nextQuestion());
    expect(store.completeDailyLesson).toHaveBeenCalledWith("reader", current.date, expect.objectContaining({ done: true, correct: 1 }));
    expect(current.phase).toBe("done");
  });

  it("prefers a lesson already saved for today", async () => {
    vi.mocked(store.getLesson).mockResolvedValue(lesson);
    await mount();
    expect(current.lesson?.title).toBe("Saved lesson");
  });

  it("still generates a first lesson when they have never had one", async () => {
    vi.mocked(store.getHistory).mockResolvedValue([]);
    vi.mocked(store.getLesson).mockResolvedValue(null);
    await mount();
    expect(fetch).toHaveBeenCalled();
  });
});

describe("saving quiz results", () => {
  it("saves the score and answers together and uses the returned streak", async () => {
    const progress = { done: true, correct: 1, total: 1, answers: [0] };
    const streak = { streak: 3, longest: 4, lastDate: "2026-09-10" };
    vi.mocked(store.completeDailyLesson).mockResolvedValue({ progress, streak });
    await mount();
    await act(async () => current.actions.startQuiz());
    await act(async () => current.actions.selectOption(0));
    await act(async () => current.actions.nextQuestion());
    expect(store.completeDailyLesson).toHaveBeenCalledWith(user.uid, current.date, progress);
    expect(current.phase).toBe("done");
    expect(current.streak).toEqual(streak);
  });

  it("advances intermediate questions without saving results early", async () => {
    vi.mocked(store.getLesson).mockResolvedValue({ ...lesson, quiz: [...lesson.quiz, ...lesson.quiz] });
    await mount();
    await act(async () => current.actions.startQuiz());
    await act(async () => current.actions.selectOption(1));
    await act(async () => current.actions.nextQuestion());
    expect(current.quiz.qIndex).toBe(1);
    expect(current.quiz.selected).toBeNull();
    expect(current.quiz.answers).toEqual([1]);
    expect(store.completeDailyLesson).not.toHaveBeenCalled();
  });

  it("shows a save failure without claiming the quiz is completed", async () => {
    vi.mocked(store.completeDailyLesson).mockRejectedValue(new Error("Offline"));
    await mount();
    await act(async () => current.actions.startQuiz());
    await act(async () => current.actions.selectOption(0));
    await act(async () => current.actions.nextQuestion());
    expect(current.phase).toBe("error");
    expect(current.errorMessage).toBe("Offline");
    expect(current.progress).toBeNull();
  });
});

describe("pre-review", () => {
  const preQuestion = { question: "Which do you expect?", options: ["A", "B", "C"], correctIndex: 0, explanation: "A." };
  const withPreQuiz: Lesson = { ...lesson, preQuiz: [preQuestion, preQuestion] };

  beforeEach(() => {
    vi.mocked(store.getLesson).mockResolvedValue(withPreQuiz);
    vi.mocked(store.getPreReviewEnabled).mockResolvedValue(true);
  });

  it("shows the pre-review before the lesson when it is turned on", async () => {
    await mount();
    expect(current.phase).toBe("prereview");
    expect(current.preReviewEnabled).toBe(true);
    expect(current.preReview.qIndex).toBe(0);
  });

  it("goes to the lesson after the last pre-review question, saving nothing", async () => {
    await mount();
    await act(async () => current.actions.answerPreReview());
    expect(current.phase).toBe("prereview");
    expect(current.preReview.qIndex).toBe(1);
    await act(async () => current.actions.answerPreReview());
    expect(current.phase).toBe("lesson");
    expect(store.completeDailyLesson).not.toHaveBeenCalled();
  });

  it("lets the reader skip straight to the lesson", async () => {
    await mount();
    await act(async () => current.actions.skipPreReview());
    expect(current.phase).toBe("lesson");
  });

  it("goes straight to the lesson when the setting is off", async () => {
    vi.mocked(store.getPreReviewEnabled).mockResolvedValue(false);
    await mount();
    expect(current.phase).toBe("lesson");
  });

  it("goes straight to the lesson when it has no pre-review questions", async () => {
    vi.mocked(store.getLesson).mockResolvedValue(lesson);
    await mount();
    expect(current.phase).toBe("lesson");
  });

  it("does not interrupt a lesson that was already completed", async () => {
    vi.mocked(store.getProgress).mockResolvedValue({ done: true, correct: 1, total: 1, answers: [0] });
    await mount();
    expect(current.phase).toBe("done");
  });

  it("saves the setting and applies it to the next lesson", async () => {
    vi.mocked(store.getPreReviewEnabled).mockResolvedValue(false);
    await mount();
    await act(async () => current.actions.setPreReview(true));
    expect(store.setPreReviewEnabled).toHaveBeenCalledWith(user.uid, true);
    expect(current.preReviewEnabled).toBe(true);
    expect(current.phase).toBe("lesson");
  });

  it("keeps the old setting and reports the error when saving fails", async () => {
    vi.mocked(store.getPreReviewEnabled).mockResolvedValue(false);
    vi.mocked(store.setPreReviewEnabled).mockRejectedValue(new Error("offline"));
    await mount();
    await expect(act(async () => current.actions.setPreReview(true))).rejects.toThrow("offline");
    expect(current.preReviewEnabled).toBe(false);
  });
});
