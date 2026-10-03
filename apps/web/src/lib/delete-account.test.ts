import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("firebase/firestore", () => ({
  doc: vi.fn((_db, ...parts: string[]) => ({ path: parts.join("/") })),
  collection: vi.fn((_db, ...parts: string[]) => ({ path: parts.join("/") })),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  deleteDoc: vi.fn(),
}));

import { collection, deleteDoc, getDocs } from "firebase/firestore";
import { createFirestoreApi } from "@random-knowledge/shared/firestore";

const { deleteAccountData } = createFirestoreApi({} as never);

function snapshotOf(docs: Record<string, unknown>[]) {
  return { docs: docs.map((data, i) => ({ id: `d${i}`, ref: { path: `ref/${i}` }, data: () => data })) };
}

function deletedPaths() {
  return vi.mocked(deleteDoc).mock.calls.map(([ref]) => (ref as unknown as { path: string }).path);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getDocs).mockImplementation(async (ref) => {
    const path = (ref as unknown as { path: string }).path;
    if (path === "users/user-a/shares") return snapshotOf([{ shareId: "share-1" }, { shareId: "share-2" }]) as never;
    return snapshotOf([]) as never;
  });
});

describe("deleting an account's data", () => {
  it("deletes the shared lesson snapshots the user created, not just the pointers to them", async () => {
    await deleteAccountData("user-a");
    expect(deletedPaths()).toEqual(expect.arrayContaining(["shares/share-1", "shares/share-2"]));
  });

  it("deletes the push token, the per-user meta docs and the access request", async () => {
    await deleteAccountData("user-a");
    expect(deletedPaths()).toEqual(
      expect.arrayContaining([
        "users/user-a/meta/pushToken",
        "users/user-a/meta/settings",
        "users/user-a/meta/streak",
        "users/user-a/meta/weights",
        "users/user-a/meta/history",
        "users/user-a/meta/categories",
        "accessRequests/user-a",
      ])
    );
  });

  it("removes the access request last, so a failure part-way leaves the account able to retry", async () => {
    await deleteAccountData("user-a");
    expect(deletedPaths().at(-1)).toBe("accessRequests/user-a");
  });

  it("reads each of the user's collections", async () => {
    await deleteAccountData("user-a");
    for (const name of ["lessons", "progress", "stash", "shares"]) {
      expect(collection).toHaveBeenCalledWith(expect.anything(), "users", "user-a", name);
    }
  });
});
