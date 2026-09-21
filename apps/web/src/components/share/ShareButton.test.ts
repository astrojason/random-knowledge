// @vitest-environment happy-dom

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ShareButton } from "./ShareButton";

vi.mock("@/lib/auth-context", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/lib/firestore", () => ({ createShare: vi.fn() }));

let container: HTMLDivElement;
let root: Root;
const resolveShareId = vi.fn();

async function clickShare() {
  await act(async () => {
    root.render(createElement(ShareButton, { title: "Newton", ownerName: "Ada", resolveShareId }));
  });
  await act(async () => container.querySelector("button")!.click());
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(console, "error").mockImplementation(() => {});
  resolveShareId.mockResolvedValue("abc");
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  Object.assign(navigator, { share: undefined });
});

it("hands the link to the native share sheet when available", async () => {
  const share = vi.fn().mockResolvedValue(undefined);
  Object.assign(navigator, { share });
  await clickShare();
  expect(share).toHaveBeenCalledWith(expect.objectContaining({ title: "Newton", url: `${window.location.origin}/share/abc` }));
});

it("copies the link when there is no share sheet", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.assign(navigator, { share: undefined });
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  await clickShare();
  expect(writeText).toHaveBeenCalledWith(expect.stringContaining("/share/abc"));
  expect(container.textContent).toContain("Link copied");
});

it("does not treat dismissing the share sheet as an error", async () => {
  Object.assign(navigator, { share: vi.fn().mockRejectedValue(new DOMException("dismissed", "AbortError")) });
  await clickShare();
  expect(container.querySelector('[role="alert"]')).toBeNull();
});

it("shows and logs a real failure", async () => {
  resolveShareId.mockRejectedValue(new Error("Missing or insufficient permissions."));
  await clickShare();
  expect(container.querySelector('[role="alert"]')?.textContent).toBe("Missing or insufficient permissions.");
  expect(console.error).toHaveBeenCalled();
});

it("renders as a labelled share icon rather than a text link", async () => {
  await act(async () => {
    root.render(createElement(ShareButton, { title: "Newton", ownerName: "Ada", resolveShareId }));
  });
  const button = container.querySelector("button")!;
  expect(button.getAttribute("aria-label")).toBe("Share this lesson");
  expect(button.querySelector("svg")).not.toBeNull();
  expect(button.textContent).toBe("");
});
