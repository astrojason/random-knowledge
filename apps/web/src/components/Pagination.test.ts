// @vitest-environment happy-dom

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Pagination } from "./Pagination";

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

const button = (label: string) => [...container.querySelectorAll("button")].find((b) => b.textContent === label)!;
const render = (props: Partial<Parameters<typeof Pagination>[0]> = {}) =>
  act(async () => root.render(createElement(Pagination, { page: 1, hasPrev: true, hasNext: true, onPrev: vi.fn(), onNext: vi.fn(), ...props })));

it("shows the page number and calls back for the neighbouring pages", async () => {
  const onPrev = vi.fn();
  const onNext = vi.fn();
  await render({ onPrev, onNext });
  expect(container.textContent).toContain("Page 2");
  await act(async () => button("Previous").click());
  await act(async () => button("Next").click());
  expect(onPrev).toHaveBeenCalledOnce();
  expect(onNext).toHaveBeenCalledOnce();
});

it("disables the buttons at either end", async () => {
  await render({ page: 0, hasPrev: false });
  expect(button("Previous").disabled).toBe(true);
  expect(button("Next").disabled).toBe(false);
});

it("renders nothing when everything fits on one page", async () => {
  await render({ page: 0, hasPrev: false, hasNext: false });
  expect(container.innerHTML).toBe("");
});
