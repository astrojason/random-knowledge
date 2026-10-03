"use client";

import { useState } from "react";
import { DeepLinks } from "@/components/lesson/DeepLinks";
import { ExplainBack } from "@/components/lesson/ExplainBack";
import { LessonBody } from "@/components/lesson/LessonBody";
import { useToast } from "@/components/Toast";
import { QuizReview } from "@/components/lesson/QuizReview";
import { ShareLessonButton } from "@/components/share/ShareButton";
import { CATEGORIES } from "@/lib/categories";
import type { DailyProgress, Lesson } from "@/lib/types";

export function DoneView({
  lesson,
  date,
  progress,
  onMore,
  onLess,
}: {
  lesson: Lesson;
  date: string;
  progress: DailyProgress;
  onMore: () => Promise<void>;
  onLess: () => Promise<void>;
}) {
  const [flashed, setFlashed] = useState<"more" | "less" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  async function handle(kind: "more" | "less", action: () => Promise<void>) {
    setError(null);
    try {
      await action();
      setFlashed(kind);
      const topic = CATEGORIES[lesson.category];
      toast(kind === "more" ? `You'll see more ${topic} lessons.` : `You'll see fewer ${topic} lessons.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your preference.");
    }
  }

  return (
    <div>
      <LessonBody lesson={lesson} />
      <div className="py-6 text-center">
        <p className="mb-1.5 font-heading text-xl text-fg-strong">
          {progress.correct} of {progress.total} today
        </p>
        <p className="mb-4 text-[13.5px] text-fg-muted">
          Today&apos;s topic: {CATEGORIES[lesson.category]}. Come back tomorrow for the next one.
        </p>
        <ExplainBack lesson={lesson} />
        <div className="flex justify-center">
          <DeepLinks lesson={lesson} />
        </div>
        <div className="mb-5"><ShareLessonButton lesson={lesson} date={date} /></div>
        <p className="mb-3 text-[13.5px] text-fg-muted">Want more or less of {CATEGORIES[lesson.category]} in future lessons?</p>
        <div className="flex justify-center gap-2.5">
          <button
            type="button"
            disabled={flashed === "less"}
            onClick={() => handle("less", onLess)}
            className="rounded-sm border border-border px-5 py-2.5 text-sm font-semibold text-fg-muted transition-opacity hover:opacity-85 disabled:opacity-60"
          >
            {flashed === "less" ? "Got it" : "Show less of this"}
          </button>
          <button
            type="button"
            disabled={flashed === "more"}
            onClick={() => handle("more", onMore)}
            className="rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-85 disabled:opacity-60"
          >
            {flashed === "more" ? "Got it" : "Show more of this"}
          </button>
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-rust">{error}</p>}
      </div>
      {progress.answers && <QuizReview lesson={lesson} answers={progress.answers} />}
    </div>
  );
}
