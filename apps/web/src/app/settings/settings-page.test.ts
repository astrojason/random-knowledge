// @vitest-environment happy-dom

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { getPreReviewEnabled, setPreReviewEnabled } from "@/lib/firestore";
import { ToastProvider } from "@/components/Toast";
import SettingsPage from "./page";

vi.mock("@/lib/firestore", () => ({ getPreReviewEnabled: vi.fn(), setPreReviewEnabled: vi.fn() }));
vi.mock("@/lib/auth-context", () => ({ useAuth: () => ({ user: { uid: "reader" } }) }));
vi.mock("@/components/AccessGate", () => ({ AccessGate: ({ children }: { children: unknown }) => children }));
vi.mock("next/link", () => ({ default: ({ href, children }: { href: string; children: unknown }) => createElement("a", { href }, children as never) }));

let container: HTMLElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.mocked(getPreReviewEnabled).mockResolvedValue(false);
  vi.mocked(setPreReviewEnabled).mockResolvedValue(undefined);
  vi.spyOn(console, "error").mockImplementation(() => {});
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const checkbox = () => container.querySelector('input[type="checkbox"]') as HTMLInputElement;
const render = () => act(async () => root.render(createElement(ToastProvider, null, createElement(SettingsPage))));

it("shows the saved pre-review choice and explains it", async () => {
  vi.mocked(getPreReviewEnabled).mockResolvedValue(true);
  await render();
  expect(getPreReviewEnabled).toHaveBeenCalledWith("reader");
  expect(checkbox().checked).toBe(true);
  expect(container.textContent).toContain("Even a wrong guess gets you thinking before you find the answer");
});

it("saves the choice when toggled", async () => {
  await render();
  await act(async () => checkbox().click());
  expect(setPreReviewEnabled).toHaveBeenCalledWith("reader", true);
  expect(checkbox().checked).toBe(true);
  expect(container.querySelector('[role="status"]')?.textContent).toContain("Pre-review turned on");
});

it("keeps the old choice and shows the error when saving fails", async () => {
  vi.mocked(setPreReviewEnabled).mockRejectedValue(new Error("offline"));
  await render();
  await act(async () => checkbox().click());
  expect(checkbox().checked).toBe(false);
  expect(container.querySelector('[role="alert"]')?.textContent).toContain("offline");
  expect(container.querySelector('[role="status"]')?.textContent).toBe("");
});

it("shows a load failure instead of a switch", async () => {
  vi.mocked(getPreReviewEnabled).mockRejectedValue(new Error("Missing permissions"));
  await render();
  expect(container.querySelector('[role="alert"]')?.textContent).toContain("Missing permissions");
  expect(container.querySelector("input")).toBeNull();
});
