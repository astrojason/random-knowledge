// @vitest-environment happy-dom

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/Toast";
import { DoneView } from "./DoneView";
import type { Lesson } from "@/lib/types";

vi.mock("@/lib/firestore", () => ({ createShare: vi.fn() }));
vi.mock("@/lib/auth-context", () => ({ useAuth: () => ({ user: null }) }));

const lesson = { category: "nature", title: "Bees", body: ["One", "Two", "Three"], wikiQuery: "bees", youtubeQuery: "bees", quiz: [] } as unknown as Lesson;
let container: HTMLElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(console, "error").mockImplementation(() => {});
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const render = (onMore: () => Promise<void>, onLess: () => Promise<void> = vi.fn()) =>
  act(async () => root.render(createElement(ToastProvider, null,
    createElement(DoneView, { lesson, date: "2026-10-03", progress: { done: true, correct: 2, total: 3 }, onMore, onLess }))));
const button = (label: string) => [...container.querySelectorAll("button")].find((b) => b.textContent === label)!;
const toasts = () => container.querySelector('[role="status"]')!.textContent;

it("confirms with a toast once the preference is saved", async () => {
  const onMore = vi.fn().mockResolvedValue(undefined);
  await render(onMore);
  await act(async () => button("Show more of this").click());
  expect(onMore).toHaveBeenCalledOnce();
  expect(toasts()).toContain("more");
  expect(button("Got it")).toBeDefined();
});

it("says fewer when asked for less", async () => {
  await render(vi.fn(), vi.fn().mockResolvedValue(undefined));
  await act(async () => button("Show less of this").click());
  expect(toasts()).toContain("fewer");
});

it("shows the error, and no toast, when the preference could not be saved", async () => {
  await render(vi.fn().mockRejectedValue(new Error("offline")));
  await act(async () => button("Show more of this").click());
  expect(container.querySelector('[role="alert"]')?.textContent).toContain("offline");
  expect(toasts()).toBe("");
  expect(button("Show more of this").disabled).toBe(false);
});
