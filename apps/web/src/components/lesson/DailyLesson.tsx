"use client";

import { useState } from "react";
import { Card } from "@/components/lesson/Card";
import { CategoryPicker } from "@/components/lesson/CategoryPicker";
import { DoneView } from "@/components/lesson/DoneView";
import { ErrorView } from "@/components/lesson/ErrorView";
import { Header } from "@/components/lesson/Header";
import { LessonView } from "@/components/lesson/LessonView";
import { LoadingView } from "@/components/lesson/LoadingView";
import { QuizView } from "@/components/lesson/QuizView";
import { useAuth } from "@/lib/auth-context";
import { isSuperadmin } from "@/lib/auth-guard";
import { useDailyLesson } from "@/lib/useDailyLesson";

export function DailyLesson() {
  const { user, claims, signOut } = useAuth();
  const { phase, date, lesson, streak, progress, quiz, selectedCategories, errorMessage, actions } = useDailyLesson(user);
  const [editingCategories, setEditingCategories] = useState(false);
  const [categoriesSaved, setCategoriesSaved] = useState(false);
  const canEditCategories = phase === "lesson" || phase === "quiz" || phase === "done";

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-10">
      <Card>
        <Header
          date={date}
          streak={streak}
          showStreak={phase !== "loading"}
          category={lesson?.category}
          showAdminLink={isSuperadmin(claims)}
          onSignOut={signOut}
        />

        {canEditCategories && !editingCategories && (
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => { setEditingCategories(true); setCategoriesSaved(false); }} className="text-sm font-semibold text-accent underline">
              My categories ({selectedCategories.length})
            </button>
            {categoriesSaved && <span role="status" className="text-xs text-fg-muted">Categories saved for future lessons.</span>}
          </div>
        )}
        {(phase === "categories" || (canEditCategories && editingCategories)) && (
          <CategoryPicker
            key={phase === "categories" ? "initial" : "edit"}
            selectedCategories={selectedCategories}
            onSave={async (categories) => {
              await actions.saveCategories(categories);
              setEditingCategories(false);
              setCategoriesSaved(true);
            }}
            onCancel={phase === "categories" ? undefined : () => setEditingCategories(false)}
          />
        )}

        {phase === "loading" && <LoadingView text="Setting things up" />}
        {phase === "generating" && <LoadingView text="Researching and checking today’s lesson" />}
        {phase === "error" && <ErrorView message={errorMessage ?? "Unknown error"} onRetry={actions.retry} />}
        {phase === "lesson" && lesson && <LessonView lesson={lesson} onStartQuiz={actions.startQuiz} />}
        {phase === "quiz" && lesson && (
          <QuizView lesson={lesson} quiz={quiz} onSelect={actions.selectOption} onNext={actions.nextQuestion} />
        )}
        {phase === "done" && lesson && progress && (
          <DoneView
            lesson={lesson}
            progress={progress}
            onMore={() => actions.adjustWeight(lesson.category, 4)}
            onLess={() => actions.adjustWeight(lesson.category, -4)}
          />
        )}

        <div className="mt-6 flex justify-between border-t border-border pt-3">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Reset your streak, history, and topic preferences? This cannot be undone.")) {
                setEditingCategories(false);
                setCategoriesSaved(false);
                actions.resetAll();
              }
            }}
            className="text-xs text-fg-muted underline"
          >
            Reset my data
          </button>
          <span />
        </div>
      </Card>
    </div>
  );
}
