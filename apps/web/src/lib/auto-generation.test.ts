import { beforeEach, expect, it, vi } from "vitest";

vi.mock("firebase/firestore", () => ({
  doc: vi.fn((_db, ...parts: string[]) => parts.join("/")),
  updateDoc: vi.fn(),
}));

import { updateDoc } from "firebase/firestore";
import { createFirestoreApi } from "@random-knowledge/shared/firestore";

const { setAutoGeneration } = createFirestoreApi({} as never);

beforeEach(() => vi.clearAllMocks());

it("turns a user's auto generation off on their access record", async () => {
  await setAutoGeneration("user-a", false);
  expect(updateDoc).toHaveBeenCalledWith("accessRequests/user-a", { autoGeneration: false });
});

it("turns it back on", async () => {
  await setAutoGeneration("user-a", true);
  expect(updateDoc).toHaveBeenCalledWith("accessRequests/user-a", { autoGeneration: true });
});
