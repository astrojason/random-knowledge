import { getStreakStatus } from "@/lib/streak";
import type { StreakData } from "@/lib/types";

export function StreakStatus({ streak, date }: { streak: StreakData; date: string }) {
  const { count, status } = getStreakStatus(streak, date);
  const messages = {
    new: "Finish a lesson and its quiz to start your streak. Every score counts.",
    done: "You showed up today. Come back tomorrow for another discovery.",
    active: "Keep it going with today’s lesson. Every score counts.",
    "at-risk": "Missed yesterday? That’s okay. Finish today’s lesson to keep your streak.",
    broken: "Two days away means a fresh start. Your personal best stays with you.",
  };

  return (
    <section aria-label="Learning streak" className="mb-5 rounded-sm border border-border bg-accent-soft p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-heading text-xl font-semibold text-accent">
          {count} {count === 1 ? "day" : "days"} in your streak
        </h2>
        <span className="text-xs font-semibold text-fg-muted">Personal best: {streak.longest || 0}</span>
      </div>
      <p role="status" className={`mt-2 text-sm ${status === "at-risk" ? "font-semibold text-rust" : "text-fg"}`}>{messages[status]}</p>
      <details className="mt-3 text-xs text-fg-muted">
        <summary className="cursor-pointer font-semibold">Don’t miss twice</summary>
        <p className="mt-2">One missed day is okay. Two missed days in a row reset your streak. Each day you finish a lesson and quiz adds one; skipped days don’t add to your count. Days reset at midnight in your device’s timezone.</p>
      </details>
    </section>
  );
}
