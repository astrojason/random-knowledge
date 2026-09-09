import { daysAgoStr } from "@/lib/date";
import type { StreakData } from "@/lib/types";

/**
 * "Don't miss twice": completing on consecutive days, or with exactly one
 * skipped day, extends the streak. Two or more consecutive missed days
 * resets it to 1.
 */
export function advanceStreak(current: StreakData, date: string): StreakData {
  if (current.lastDate === date) return current;

  const oneDayAgo = daysAgoStr(1);
  const twoDaysAgo = daysAgoStr(2);
  const newStreak =
    current.lastDate === oneDayAgo || current.lastDate === twoDaysAgo
      ? current.streak + 1
      : 1;

  return {
    streak: newStreak,
    longest: Math.max(newStreak, current.longest || 0),
    lastDate: date,
  };
}
