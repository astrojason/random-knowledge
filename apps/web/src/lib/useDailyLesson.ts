"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "firebase/auth";
import { CATEGORY_KEYS, defaultWeights, pickCategory, type CategoryKey, type Weights } from "@/lib/categories";
import { todayStr } from "@/lib/date";
import {
  appendHistory,
  completeDailyLesson,
  getHistory,
  getLesson,
  getProgress,
  getSelectedCategories,
  getStreak,
  getWeights,
  resetAllUserData,
  setLesson,
  setSelectedCategories,
  setWeights,
} from "@/lib/firestore";
import { advanceQuiz, initialQuizState, selectAnswer } from "@/lib/quiz";
import type { DailyProgress, GeneratedLesson, Lesson, StreakData } from "@/lib/types";

export type Phase = "loading" | "categories" | "generating" | "error" | "lesson" | "quiz" | "done";

export function useDailyLesson(user: User | null) {
  const busy = useRef(false);
  const [phase, setPhase] = useState<Phase>("loading");
  const [date, setDate] = useState(todayStr());
  const [lesson, setLessonState] = useState<Lesson | null>(null);
  const [streak, setStreakState] = useState<StreakData>({ streak: 0, longest: 0, lastDate: null });
  const [weights, setWeightsState] = useState<Weights>(defaultWeights());
  const [selectedCategories, setSelectedCategoriesState] = useState<CategoryKey[]>(CATEGORY_KEYS);
  const [progress, setProgressState] = useState<DailyProgress | null>(null);
  const [quiz, setQuiz] = useState(initialQuizState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user || busy.current) return;
    busy.current = true;
    setPhase("loading");
    setErrorMessage(null);
    const today = todayStr();
    setDate(today);

    try {
      const [existingLesson, streakData, weightsData, history, progressData, categoriesData] = await Promise.all([
        getLesson(user.uid, today),
        getStreak(user.uid),
        getWeights(user.uid),
        getHistory(user.uid),
        getProgress(user.uid, today),
        getSelectedCategories(user.uid),
      ]);
      setStreakState(streakData);
      setWeightsState(weightsData);
      setSelectedCategoriesState(categoriesData ?? CATEGORY_KEYS);
      setLessonState(existingLesson);
      if (!existingLesson && !categoriesData) {
        setPhase("categories");
        return;
      }

      let currentLesson = existingLesson;
      if (!currentLesson) {
        setPhase("generating");
        const recentCats = history.slice(-2).map((h) => h.category);
        const category = pickCategory(weightsData, recentCats, categoriesData ?? CATEGORY_KEYS);
        const recentTitles = history.slice(-12).map((h) => h.title);

        const idToken = await user.getIdToken();
        const res = await fetch("/api/generate-lesson", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ category, recentTitles }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const generated: GeneratedLesson & { category: CategoryKey } = await res.json();
        currentLesson = generated;
        await setLesson(user.uid, today, currentLesson);
        await appendHistory(user.uid, { date: today, category, title: currentLesson.title }, history);
      }

      setLessonState(currentLesson);
      setProgressState(progressData);
      setQuiz(initialQuizState);
      setPhase(progressData?.done ? "done" : "lesson");
    } catch (err) {
      console.error("useDailyLesson load failed:", err);
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("error");
    } finally {
      busy.current = false;
    }
  }, [user]);

  useEffect(() => {
    // Intentional: (re)load today's lesson/streak/progress whenever the
    // signed-in user changes. This is a genuine remote-data fetch keyed off
    // `user`, not derived state — see https://react.dev/learn/you-might-not-need-an-effect#fetching-data.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    // Refresh on local midnight, waking a suspended tab, or a device timezone change.
    // Let an in-progress quiz finish on its original lesson date before loading the next.
    const refreshDate = () => {
      if (document.visibilityState === "visible" && phase !== "quiz" && !busy.current && todayStr() !== date) {
        void load();
      }
    };
    const timer = window.setInterval(refreshDate, 1000);
    window.addEventListener("focus", refreshDate);
    document.addEventListener("visibilitychange", refreshDate);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshDate);
      document.removeEventListener("visibilitychange", refreshDate);
    };
  }, [date, phase, load]);

  function startQuiz() {
    setQuiz(initialQuizState);
    setPhase("quiz");
  }

  function selectOption(index: number) {
    if (!lesson) return;
    setQuiz((q) => selectAnswer(q, index, lesson.quiz[q.qIndex].correctIndex));
  }

  async function nextQuestion() {
    if (!user || !lesson || busy.current) return;
    const advanced = advanceQuiz(quiz, lesson.quiz.length);
    if (advanced !== "complete") {
      setQuiz(advanced);
      return;
    }
    const finalProgress: DailyProgress = {
      done: true,
      correct: quiz.correct,
      total: lesson.quiz.length,
      answers: quiz.answers,
    };
    busy.current = true;
    try {
      const saved = await completeDailyLesson(user.uid, date, finalProgress);
      setStreakState(saved.streak);
      setProgressState(saved.progress);
      setPhase("done");
    } catch (err) {
      console.error("Failed to save quiz results:", err);
      setErrorMessage(err instanceof Error ? err.message : "Failed to save your results.");
      setPhase("error");
    } finally {
      busy.current = false;
    }
  }

  async function adjustWeight(category: CategoryKey, delta: number) {
    if (!user) return;
    const next = { ...weights, [category]: Math.min(Math.max((weights[category] || 10) + delta, 2), 40) };
    setWeightsState(next);
    try {
      await setWeights(user.uid, next);
    } catch (err) {
      console.error("Failed to save weight adjustment:", err);
      setErrorMessage(err instanceof Error ? err.message : "Failed to save your preference.");
    }
  }

  async function resetAll() {
    if (!user) return;
    try {
      await resetAllUserData(user.uid);
      setStreakState({ streak: 0, longest: 0, lastDate: null });
      setWeightsState(defaultWeights());
      await load();
    } catch (err) {
      console.error("Reset failed:", err);
      setErrorMessage(err instanceof Error ? err.message : "Reset failed.");
      setPhase("error");
    }
  }

  async function saveCategories(categories: CategoryKey[]) {
    if (!user) throw new Error("Sign in to save your categories.");
    await setSelectedCategories(user.uid, categories);
    setSelectedCategoriesState(categories);
    if (phase === "categories") await load();
  }

  return {
    phase,
    date,
    lesson,
    streak,
    weights,
    selectedCategories,
    progress,
    quiz,
    errorMessage,
    categoryKeys: CATEGORY_KEYS,
    actions: { retry: load, startQuiz, selectOption, nextQuestion, adjustWeight, resetAll, saveCategories },
  };
}
