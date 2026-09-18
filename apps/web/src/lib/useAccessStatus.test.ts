// @vitest-environment happy-dom

import { act, createElement, useLayoutEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { User } from "firebase/auth";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAccessStatus } from "./useAccessStatus";
import * as store from "./firestore";
import type { AuthClaims } from "./auth-guard";

vi.mock("./firestore", () => ({
  getAccessRequest: vi.fn(),
  recordAccessRequest: vi.fn(),
}));

const user = { uid: "owner" } as unknown as User;
let root: Root;
let current: ReturnType<typeof useAccessStatus>;

function Harness({ claims }: { claims: AuthClaims | null }) {
  const state = useAccessStatus(user, claims);
  useLayoutEffect(() => {
    current = state;
  });
  return null;
}

async function render(claims: AuthClaims | null) {
  await act(async () => root.render(createElement(Harness, { claims })));
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(console, "error").mockImplementation(() => {});
  root = createRoot(document.createElement("div"));
});

afterEach(async () => {
  await act(async () => root.unmount());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("useAccessStatus", () => {
  it("keeps the superadmin result even when an earlier, stale (pre-claims) resolution finishes later", async () => {
    // The real ID-token claims land in a separate render from the initial
    // `user` update (see mobile/web auth-context.tsx setting `user` and
    // `claims` in two steps), so this hook briefly sees claims=null before
    // seeing the real claims. The claims=null pass takes the slow
    // Firestore round trip below; the real superadmin pass resolves
    // synchronously. Whichever finishes last currently wins the race.
    vi.mocked(store.recordAccessRequest).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 20))
    );
    vi.mocked(store.getAccessRequest).mockResolvedValue({
      uid: "owner",
      email: null,
      displayName: null,
      status: "pending",
      firstSeenAt: "2026-09-01",
      lastSeenAt: "2026-09-01",
    });

    await render(null);
    await render({ superadmin: true });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 30));
    });

    expect(current.status).toBe("superadmin");
  });
});
