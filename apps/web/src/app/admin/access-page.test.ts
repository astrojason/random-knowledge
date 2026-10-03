// @vitest-environment happy-dom

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/Toast";
import { grantAccess, listAccessRequests, revokeAccess, setAutoGeneration } from "@/lib/firestore";
import AdminAccessPage from "./access/page";

vi.mock("@/lib/firestore", () => ({ listAccessRequests: vi.fn(), grantAccess: vi.fn(), revokeAccess: vi.fn(), setAutoGeneration: vi.fn() }));
vi.mock("@/lib/auth-context", () => ({ useAuth: () => ({ user: { uid: "admin" } }) }));

const person = (status: "pending" | "granted") => ({ uid: "reader", email: "r@example.com", displayName: "Reader", status, firstSeenAt: "2026-09-01", lastSeenAt: "2026-09-01" });
let container: HTMLElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(grantAccess).mockResolvedValue(undefined);
  vi.mocked(revokeAccess).mockResolvedValue(undefined);
  vi.mocked(setAutoGeneration).mockResolvedValue(undefined);
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const render = (status: "pending" | "granted") => {
  vi.mocked(listAccessRequests).mockResolvedValue([person(status)]);
  return act(async () => root.render(createElement(ToastProvider, null, createElement(AdminAccessPage))));
};
const click = (label: string) => act(async () => [...container.querySelectorAll("button")].find((b) => b.textContent === label)!.click());
const toasts = () => container.querySelector('[role="status"]')!.textContent;

it("confirms a grant with a toast", async () => {
  await render("pending");
  await click("Grant");
  expect(grantAccess).toHaveBeenCalledWith("reader", "admin");
  expect(toasts()).toContain("Access granted");
});

it("confirms a revoke and an auto lessons change", async () => {
  await render("granted");
  await click("Auto lessons: on");
  expect(toasts()).toContain("Auto lessons turned off");
  await click("Revoke");
  expect(toasts()).toContain("Access revoked");
});

it("shows the error, and no toast, when a change fails", async () => {
  vi.mocked(grantAccess).mockRejectedValue(new Error("Missing permissions"));
  await render("pending");
  await click("Grant");
  expect(container.querySelector('[role="alert"]')?.textContent).toContain("Missing permissions");
  expect(toasts()).toBe("");
});
