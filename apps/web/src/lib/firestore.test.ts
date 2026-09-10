import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  doc: vi.fn((_db, ...parts: string[]) => parts.join("/")),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  collection: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  runTransaction: vi.fn(),
}));

import { getDoc, runTransaction, setDoc } from "firebase/firestore";
import { completeDailyLesson, getSelectedCategories, setSelectedCategories } from "./firestore";

function savedDocument(selected: unknown, exists = true) {
  vi.mocked(getDoc).mockResolvedValue({
    exists: () => exists,
    data: () => ({ selected }),
  } as unknown as Awaited<ReturnType<typeof getDoc>>);
}

beforeEach(() => vi.clearAllMocks());

describe("category preferences", () => {
  it("asks users without saved preferences to choose categories", async () => {
    savedDocument(undefined, false);
    expect(await getSelectedCategories("user-a")).toBeNull();
    expect(getDoc).toHaveBeenCalledWith("users/user-a/meta/categories");
  });

  it("loads saved selections without opting the user into other categories", async () => {
    savedDocument(["physics", "unknown", "physics", "mythology"]);
    expect(await getSelectedCategories("user-a")).toEqual(["physics", "mythology"]);
  });

  it.each([[], ["unknown"], "physics", null])("requires a new selection for unusable saved data: %j", async (saved) => {
    savedDocument(saved);
    expect(await getSelectedCategories("user-a")).toBeNull();
  });

  it("saves selections under the signed-in user's document", async () => {
    await setSelectedCategories("user-a", ["physics", "mythology"]);
    expect(setDoc).toHaveBeenCalledWith("users/user-a/meta/categories", { selected: ["physics", "mythology"] });
  });

  it("does not overwrite preferences with an empty selection", async () => {
    await expect(setSelectedCategories("user-a", [])).rejects.toThrow("Choose at least one category.");
    expect(setDoc).not.toHaveBeenCalled();
  });
});

describe("streak completion transaction", () => {
  function setup() {
    const stored = new Map<string, unknown>([
      ["users/user-a/meta/streak", { streak: 5, longest: 8, lastDate: "2026-01-01" }],
    ]);
    const writes = vi.fn((ref: string, data: unknown) => stored.set(ref, data));
    const transaction = {
      get: vi.fn(async (ref: string) => ({ exists: () => stored.has(ref), data: () => stored.get(ref) })),
      set: writes,
    };
    vi.mocked(runTransaction).mockImplementation(async (_db, callback) => callback(transaction as unknown as Parameters<typeof callback>[0]));
    return { stored, writes };
  }
  const progress = { done: true, correct: 0, total: 3, answers: [0, 0, 0] };

  it("saves both progress and streak, even with no correct answers", async () => {
    const { stored, writes } = setup();
    const result = await completeDailyLesson("user-a", "2026-01-03", progress);
    expect(result.streak).toEqual({ streak: 6, longest: 8, lastDate: "2026-01-03" });
    expect(stored.get("users/user-a/progress/2026-01-03")).toEqual(progress);
    expect(writes).toHaveBeenCalledTimes(2);
  });

  it("uses persisted data and preserves the first completion on a retry", async () => {
    const { writes } = setup();
    await completeDailyLesson("user-a", "2026-01-03", progress);
    const repeated = await completeDailyLesson("user-a", "2026-01-03", { ...progress, correct: 3 });
    expect(repeated.streak.streak).toBe(6);
    expect(repeated.progress.correct).toBe(0);
    expect(writes).toHaveBeenCalledTimes(2);
  });

  it("rejects an unfinished quiz before opening a transaction", async () => {
    await expect(completeDailyLesson("user-a", "2026-01-03", { ...progress, done: false })).rejects.toThrow("Finish the quiz");
    expect(runTransaction).not.toHaveBeenCalled();
  });
});
