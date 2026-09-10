import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultWeights, pickCategory } from "./categories";

afterEach(() => vi.restoreAllMocks());

describe("selected categories", () => {
  it("never draws an excluded category, even when it has a much higher weight", () => {
    const weights = { ...defaultWeights(), psychology: 10000 };
    for (const random of [0, 0.25, 0.5, 0.99]) {
      vi.spyOn(Math, "random").mockReturnValue(random);
      expect(["physics", "history"]).toContain(pickCategory(weights, [], ["physics", "history"]));
    }
  });

  it("allows a single selected category even if it was recently used", () => {
    expect(pickCategory(defaultWeights(), ["astronomy"], ["astronomy"])).toBe("astronomy");
  });

  it("avoids recent categories within the selection when possible", () => {
    expect(pickCategory(defaultWeights(), ["history"], ["history", "physics"])).toBe("physics");
  });

  it("falls back only to selected categories when all were recently used", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    expect(["history", "physics"]).toContain(pickCategory(defaultWeights(), ["history", "physics"], ["history", "physics"]));
  });

  it("preserves preference weighting among selected categories", () => {
    const weights = { ...defaultWeights(), history: 30, physics: 10 };
    vi.spyOn(Math, "random").mockReturnValue(0.7);
    expect(pickCategory(weights, [], ["history", "physics"])).toBe("history");
    vi.spyOn(Math, "random").mockReturnValue(0.8);
    expect(pickCategory(weights, [], ["history", "physics"])).toBe("physics");
  });

  it("rejects an empty selection instead of generating an unwanted topic", () => {
    expect(() => pickCategory(defaultWeights(), [], [])).toThrow("Choose at least one category.");
  });
});
