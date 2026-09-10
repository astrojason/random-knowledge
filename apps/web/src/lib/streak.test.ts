import { describe, expect, it } from "vitest";
import { advanceStreak, getStreakStatus } from "./streak";

const current = { streak: 7, longest: 12, lastDate: "2026-01-31" };

describe("don't miss twice", () => {
  it("extends on the next calendar day, using the supplied date", () => {
    expect(advanceStreak(current, "2026-02-01")).toEqual({ streak: 8, longest: 12, lastDate: "2026-02-01" });
  });
  it("allows one missed day without counting that day as a completion", () => {
    expect(advanceStreak(current, "2026-02-02").streak).toBe(8);
  });
  it("resets after two missed days and preserves the best", () => {
    expect(advanceStreak(current, "2026-02-03")).toEqual({ streak: 1, longest: 12, lastDate: "2026-02-03" });
  });
  it("does not count repeat or older completions", () => {
    expect(advanceStreak(current, "2026-01-31")).toEqual(current);
    expect(advanceStreak(current, "2026-01-30")).toEqual(current);
  });
  it("starts a new streak and updates a personal best", () => {
    expect(advanceStreak({ streak: 0, longest: 0, lastDate: null }, "2026-02-01").longest).toBe(1);
    expect(advanceStreak({ ...current, longest: 7 }, "2026-02-01").longest).toBe(8);
  });
  it.each([
    ["2024-02-28", "2024-03-01"],
    ["2025-12-31", "2026-01-02"],
    ["2026-03-07", "2026-03-09"],
    ["2026-10-31", "2026-11-02"],
  ])("handles calendar boundaries: %s to %s", (lastDate, date) => {
    expect(advanceStreak({ ...current, lastDate }, date).streak).toBe(8);
  });
  it("shows a fresh streak, completed today, an active streak, and a last-chance day", () => {
    expect(getStreakStatus({ streak: 0, longest: 0, lastDate: null }, "2026-02-01")).toEqual({ count: 0, status: "new" });
    expect(getStreakStatus(current, "2026-01-31")).toEqual({ count: 7, status: "done" });
    expect(getStreakStatus(current, "2026-02-01")).toEqual({ count: 7, status: "active" });
    expect(getStreakStatus(current, "2026-02-02")).toEqual({ count: 7, status: "at-risk" });
  });
  it("shows an expired streak as zero before another lesson is completed", () => {
    expect(getStreakStatus(current, "2026-02-03")).toEqual({ count: 0, status: "broken" });
  });
});
