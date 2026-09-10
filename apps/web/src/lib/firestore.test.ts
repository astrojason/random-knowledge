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
}));

import { getDoc, setDoc } from "firebase/firestore";
import { getSelectedCategories, setSelectedCategories } from "./firestore";

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
