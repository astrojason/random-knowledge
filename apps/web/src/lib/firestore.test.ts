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

import { deleteDoc, doc, getDoc, getDocs, runTransaction, setDoc } from "firebase/firestore";
import { addToStash, completeDailyLesson, createShare, getLesson, getShare, getStash, removeFromStash, getSelectedCategories, setLesson, setSelectedCategories } from "./firestore";
import type { Lesson } from "./types";

/** Firestore's setDoc() rejects any value where an array directly contains another array. */
function hasNestedArray(value: unknown): boolean {
  if (Array.isArray(value)) return value.some((item) => Array.isArray(item) || hasNestedArray(item));
  if (value && typeof value === "object") return Object.values(value).some(hasNestedArray);
  return false;
}

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

describe("lesson persistence", () => {
  const lesson: Lesson = {
    category: "physics",
    title: "Newton's laws",
    body: ["p1", "p2", "p3"],
    wikiQuery: "Newton's laws",
    youtubeQuery: "Newton's laws",
    quiz: [{ question: "q", options: ["a", "b"], correctIndex: 0, explanation: "e" }],
    sources: [{ title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Newton" }],
    paragraphSources: [[1], [2], [1, 2]],
  };

  it("never sends setDoc a value with an array directly containing another array", async () => {
    await setLesson("user-a", "2026-09-11", lesson);
    expect(setDoc).toHaveBeenCalledTimes(1);
    const written = vi.mocked(setDoc).mock.calls[0][1];
    expect(hasNestedArray(written)).toBe(false);
  });

  it("round-trips paragraphSources through save and load unchanged", async () => {
    await setLesson("user-a", "2026-09-11", lesson);
    const written = vi.mocked(setDoc).mock.calls[0][1];
    vi.mocked(getDoc).mockResolvedValue({ exists: () => true, data: () => written } as unknown as Awaited<ReturnType<typeof getDoc>>);
    const loaded = await getLesson("user-a", "2026-09-11");
    expect(loaded).toEqual(lesson);
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

describe("sharing lessons", () => {
  const lesson: Lesson = {
    category: "physics",
    title: "Newton's laws",
    body: ["p1"],
    wikiQuery: "q",
    youtubeQuery: "q",
    quiz: [],
    paragraphSources: [[1, 2]],
  };
  const exists = (data: unknown) => ({ exists: () => true, data: () => data }) as unknown as Awaited<ReturnType<typeof getDoc>>;
  const missing = { exists: () => false } as unknown as Awaited<ReturnType<typeof getDoc>>;

  beforeEach(() => {
    // doc(collectionRef) with no path parts is Firestore's auto-id form.
    vi.mocked(doc).mockImplementation(((...args: unknown[]) => (args.length === 1 ? { id: "new-share" } : args.slice(1).join("/"))) as never);
  });

  it("creates a share snapshot once per lesson date and remembers its id", async () => {
    vi.mocked(getDoc).mockResolvedValue(missing);
    const id = await createShare({ uid: "user-a", displayName: "Ada" }, "2026-09-20", lesson);
    expect(id).toBe("new-share");
    expect(setDoc).toHaveBeenCalledWith("shares/new-share", expect.objectContaining({
      ownerUid: "user-a",
      ownerName: "Ada",
      date: "2026-09-20",
      title: "Newton's laws",
      category: "physics",
      lesson: expect.objectContaining({ paragraphSources: [{ refs: [1, 2] }] }),
    }));
    expect(setDoc).toHaveBeenCalledWith("users/user-a/shares/2026-09-20", { shareId: "new-share" });
  });

  it("reuses the existing share instead of creating another", async () => {
    vi.mocked(getDoc).mockResolvedValue(exists({ shareId: "old-share" }));
    expect(await createShare({ uid: "user-a", displayName: "Ada" }, "2026-09-20", lesson)).toBe("old-share");
    expect(setDoc).not.toHaveBeenCalled();
  });

  it("loads a share with its lesson decoded", async () => {
    vi.mocked(getDoc).mockResolvedValue(exists({
      ownerName: "Ada", title: "Newton's laws", category: "physics", createdAt: "2026-09-20",
      lesson: { ...lesson, paragraphSources: [{ refs: [1, 2] }] },
    }));
    const share = await getShare("abc");
    expect(getDoc).toHaveBeenCalledWith("shares/abc");
    expect(share).toMatchObject({ id: "abc", ownerName: "Ada", lesson: { paragraphSources: [[1, 2]] } });
  });

  it("returns null for a share that does not exist", async () => {
    vi.mocked(getDoc).mockResolvedValue(missing);
    expect(await getShare("nope")).toBeNull();
  });

  it("stashes a copy of a share under the reader's account", async () => {
    await addToStash("user-b", { id: "abc", ownerName: "Ada", title: "Newton's laws", category: "physics", createdAt: "2026-09-20", lesson });
    expect(setDoc).toHaveBeenCalledWith("users/user-b/stash/abc", expect.objectContaining({
      sharedBy: "Ada",
      title: "Newton's laws",
      lesson: expect.objectContaining({ paragraphSources: [{ refs: [1, 2] }] }),
    }));
  });

  it("lists the stash newest first", async () => {
    vi.mocked(getDocs).mockResolvedValue({
      docs: [
        { id: "a", data: () => ({ savedAt: "2026-09-01", sharedBy: null, title: "A", category: "physics", lesson }) },
        { id: "b", data: () => ({ savedAt: "2026-09-10", sharedBy: "Ada", title: "B", category: "physics", lesson }) },
      ],
    } as unknown as Awaited<ReturnType<typeof getDocs>>);
    expect((await getStash("user-b")).map((entry) => entry.id)).toEqual(["b", "a"]);
  });

  it("removes a stashed lesson", async () => {
    await removeFromStash("user-b", "abc");
    expect(deleteDoc).toHaveBeenCalledWith("users/user-b/stash/abc");
  });
});
