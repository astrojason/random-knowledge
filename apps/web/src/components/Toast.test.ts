// @vitest-environment happy-dom

import { act, createElement, useLayoutEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "./Toast";

let container: HTMLElement;
let root: Root;
let show: (message: string) => void;

function Trigger() {
  const toast = useToast();
  useLayoutEffect(() => { show = toast; });
  return null;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const mount = () => act(async () => root.render(createElement(ToastProvider, null, createElement(Trigger))));
const region = () => container.querySelector('[role="status"]') as HTMLElement;

it("floats in the bottom right corner of the viewport, announced politely", async () => {
  await mount();
  expect(region().className).toContain("fixed");
  expect(region().className).toContain("bottom-");
  expect(region().className).toContain("right-");
  expect(region().getAttribute("aria-live")).toBe("polite");
});

it("shows a message, then removes it after a few seconds", async () => {
  await mount();
  await act(async () => show("Saved."));
  expect(region().textContent).toBe("Saved.");
  await act(async () => vi.advanceTimersByTime(5000));
  expect(region().textContent).toBe("");
});

it("stacks several messages and removes each on its own timer", async () => {
  await mount();
  await act(async () => show("First"));
  await act(async () => vi.advanceTimersByTime(2000));
  await act(async () => show("Second"));
  expect(region().textContent).toBe("FirstSecond");
  await act(async () => vi.advanceTimersByTime(2500));
  expect(region().textContent).toBe("Second");
});

it("does nothing, rather than throwing, when used outside a provider", async () => {
  await act(async () => root.render(createElement(Trigger)));
  expect(() => show("Ignored")).not.toThrow();
});
