// @vitest-environment happy-dom

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PAGE_SIZE } from "@/lib/pagination";
import { listAccessRequests, listCronRunLog, listGenerationLog } from "@/lib/firestore";
import GenerationLogPage from "./generation-log/page";
import CronLogPage from "./cron-log/page";

vi.mock("@/lib/firestore", () => ({ listAccessRequests: vi.fn(), listGenerationLog: vi.fn(), listCronRunLog: vi.fn() }));

let container: HTMLElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.mocked(listAccessRequests).mockResolvedValue([]);
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

const at = (i: number) => new Date(Date.UTC(2026, 9, 30 - i)).toISOString();
const generation = (i: number) => ({ uid: "u", title: `Lesson ${i}`, createdAt: at(i) });
const cronRun = (i: number) => ({ date: `2026-10-${30 - i}`, createdAt: at(i), stoppedForTokenLimit: false, results: [] });
const button = (label: string) => [...container.querySelectorAll("button")].find((b) => b.textContent === label)!;

it("pages the generation log with a cursor after the last entry shown", async () => {
  // One extra row tells the page there is a next page without a separate count query.
  vi.mocked(listGenerationLog).mockImplementation(async (_size, after) =>
    after ? [generation(PAGE_SIZE)] : Array.from({ length: PAGE_SIZE + 1 }, (_, i) => generation(i)));
  await act(async () => root.render(createElement(GenerationLogPage)));

  expect(listGenerationLog).toHaveBeenCalledWith(PAGE_SIZE + 1, null);
  expect(container.querySelectorAll("li")).toHaveLength(PAGE_SIZE);
  expect(container.textContent).not.toContain(`Lesson ${PAGE_SIZE}`);

  await act(async () => button("Next").click());
  expect(listGenerationLog).toHaveBeenLastCalledWith(PAGE_SIZE + 1, at(PAGE_SIZE - 1));
  expect(container.textContent).toContain(`Lesson ${PAGE_SIZE}`);
  expect(button("Next").disabled).toBe(true);

  await act(async () => button("Previous").click());
  expect(container.textContent).toContain("Lesson 0");
});

it("surfaces a generation log load failure", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(listGenerationLog).mockRejectedValue(new Error("Missing permissions"));
  await act(async () => root.render(createElement(GenerationLogPage)));
  expect(container.querySelector('[role="alert"]')?.textContent).toContain("Missing permissions");
});

it("pages the cron run log", async () => {
  vi.mocked(listCronRunLog).mockResolvedValue(Array.from({ length: PAGE_SIZE + 1 }, (_, i) => cronRun(i)));
  await act(async () => root.render(createElement(CronLogPage)));
  expect(listCronRunLog).toHaveBeenCalledWith(PAGE_SIZE + 1, null);
  expect(container.querySelectorAll("li > div")).toHaveLength(PAGE_SIZE);
  expect(button("Next").disabled).toBe(false);
});
