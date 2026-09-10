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
  appendHistory: vi.fn(), completeDailyLesson: vi.fn(), getHistory: vi.fn(), getLesson: vi.fn(),
  getProgress: vi.fn(), getSelectedCategories: vi.fn(), getStreak: vi.fn(), getWeights: vi.fn(),
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
  vi.mocked(store.getProgress).mockResolvedValue(null);
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
