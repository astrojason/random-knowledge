import type { StreakData } from "@/lib/types";

function calendarGap(lastDate: string, date: string): number {
  return (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${lastDate}T00:00:00Z`)) / 86_400_000;
}

export function getStreakStatus(current: StreakData, date: string): {
  count: number;
  status: "new" | "done" | "active" | "at-risk" | "broken";
} {
  if (!current.lastDate || current.streak <= 0) return { count: 0, status: "new" };
  const gap = calendarGap(current.lastDate, date);
  if (gap <= 0) return { count: current.streak, status: "done" };
  if (gap === 1) return { count: current.streak, status: "active" };
  if (gap === 2) return { count: current.streak, status: "at-risk" };
  return { count: 0, status: "broken" };
}

/**
 * "Don't miss twice": completing on consecutive days, or with exactly one
 * skipped day, extends the streak. Two or more consecutive missed days
 * resets it to 1.
 */
export function advanceStreak(current: StreakData, date: string): StreakData {
  if (current.lastDate && current.lastDate >= date) return current;
  const gap = current.lastDate ? calendarGap(current.lastDate, date) : Infinity;
  const newStreak = gap === 1 || gap === 2 ? current.streak + 1 : 1;

  return {
    streak: newStreak,
    longest: Math.max(newStreak, current.longest || 0),
    lastDate: date,
  };
}
