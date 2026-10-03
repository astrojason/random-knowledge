// @vitest-environment happy-dom

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PAGE_SIZE } from "@/lib/pagination";
import { PagedLinkList } from "./PagedLinkList";

vi.mock("next/link", () => ({ default: ({ href, children, className }: { href: string; children: unknown; className?: string }) => createElement("a", { href, className }, children as never) }));

let container: HTMLElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  vi.unstubAllGlobals();
});

const items = (count: number) => Array.from({ length: count }, (_, i) => ({ key: `k${i}`, href: `/lesson/${i}`, title: `Lesson ${i}`, detail: "detail" }));
const titles = () => [...container.querySelectorAll("li")].map((li) => li.textContent?.replace("detail", ""));
const button = (label: string) => [...container.querySelectorAll("button")].find((b) => b.textContent === label)!;

it("shows one page at a time and moves between pages", async () => {
  await act(async () => root.render(createElement(PagedLinkList, { items: items(PAGE_SIZE * 2 + 3) })));
  expect(titles()).toHaveLength(PAGE_SIZE);
  expect(titles()[0]).toBe("Lesson 0");

  await act(async () => button("Next").click());
  expect(titles()[0]).toBe(`Lesson ${PAGE_SIZE}`);
  await act(async () => button("Next").click());
  expect(titles()).toHaveLength(3);
  expect(button("Next").disabled).toBe(true);

  await act(async () => button("Previous").click());
  expect(titles()[0]).toBe(`Lesson ${PAGE_SIZE}`);
});

it("has no paging controls when the list fits on one page", async () => {
  await act(async () => root.render(createElement(PagedLinkList, { items: items(PAGE_SIZE) })));
  expect(container.querySelectorAll("button")).toHaveLength(0);
});
