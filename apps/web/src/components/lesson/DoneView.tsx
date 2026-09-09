"use client";

import { useState } from "react";
import { DeepLinks } from "@/components/lesson/DeepLinks";
import { CATEGORIES } from "@/lib/categories";
import type { DailyProgress, Lesson } from "@/lib/types";

export function DoneView({
  lesson,
  progress,
  onMore,
  onLess,
}: {
  lesson: Lesson;
  progress: DailyProgress;
  onMore: () => void;
  onLess: () => void;
}) {
  const [flashed, setFlashed] = useState<"more" | "less" | null>(null);

  function handle(kind: "more" | "less", action: () => void) {
    action();
    setFlashed(kind);
  }

  return (
    <div className="py-6 text-center">
      <p className="mb-1.5 font-heading text-xl text-fg-strong">
        {progress.correct} of {progress.total} today
      </p>
      <p className="mb-4 text-[13.5px] text-fg-muted">
        Today&apos;s topic: {CATEGORIES[lesson.category]}. Come back tomorrow for the next one.
      </p>
      <div className="flex justify-center">
        <DeepLinks lesson={lesson} />
      </div>
      <p className="mb-3 text-[13.5px] text-fg-muted">Want more like this, or less?</p>
      <div className="flex justify-center gap-2.5">
        <button
          type="button"
          disabled={flashed === "less"}
          onClick={() => handle("less", onLess)}
          className="rounded-sm border border-border px-5 py-2.5 text-sm font-semibold text-fg-muted transition-opacity hover:opacity-85 disabled:opacity-60"
        >
          {flashed === "less" ? "Got it" : `Less ${CATEGORIES[lesson.category]}`}
        </button>
        <button
          type="button"
          disabled={flashed === "more"}
          onClick={() => handle("more", onMore)}
          className="rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-85 disabled:opacity-60"
        >
          {flashed === "more" ? "Got it" : `More ${CATEGORIES[lesson.category]}`}
        </button>
      </div>
    </div>
  );
}
