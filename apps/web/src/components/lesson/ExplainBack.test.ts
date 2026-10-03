// @vitest-environment happy-dom

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ExplainBack } from "./ExplainBack";
import type { Lesson } from "@/lib/types";

const getIdToken = vi.fn().mockResolvedValue("token");
vi.mock("@/lib/auth-context", () => ({ useAuth: () => ({ user: { uid: "reader", getIdToken } }) }));

const lesson = { category: "nature", title: "Bees", body: ["One", "Two", "Three"], quiz: [] } as unknown as Lesson;
let container: HTMLElement;
let root: Root;

function routes(handlers: { available?: unknown; feedback?: Response }) {
  vi.stubGlobal("fetch", vi.fn(async (_url: string, init?: RequestInit) => {
    if (init?.method === "POST") return handlers.feedback ?? Response.json({ feedback: "You nailed the main idea." });
    return handlers.available instanceof Response ? handlers.available : Response.json({ available: handlers.available ?? true });
  }));
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(console, "error").mockImplementation(() => {});
  getIdToken.mockResolvedValue("token");
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const render = () => act(async () => root.render(createElement(ExplainBack, { lesson })));
const button = (label: string) => [...container.querySelectorAll("button")].find((b) => b.textContent === label);
const textarea = () => container.querySelector("textarea") as HTMLTextAreaElement;

async function type(value: string) {
  const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!;
  await act(async () => {
    setValue.call(textarea(), value);
    textarea().dispatchEvent(new Event("input", { bubbles: true }));
  });
}

it("is hidden when the day's tokens are nearly used up", async () => {
  routes({ available: false });
  await render();
  expect(container.textContent).toBe("");
});

it("is hidden when availability can't be checked, and logs why", async () => {
  routes({ available: Response.json({ error: "Token tracker unreachable" }, { status: 503 }) });
  await render();
  expect(container.textContent).toBe("");
  expect(console.error).toHaveBeenCalled();
});

it("offers the button when tokens remain, then asks for the reader's own words", async () => {
  routes({});
  await render();
  expect(fetch).toHaveBeenCalledWith("/api/explain-back", expect.objectContaining({ headers: { Authorization: "Bearer token" } }));
  await act(async () => button("Explain it back")!.click());
  expect(textarea()).not.toBeNull();
  expect(button("Get feedback")!.disabled).toBe(true);
});

it("sends the explanation with the lesson and shows the feedback", async () => {
  routes({});
  await render();
  await act(async () => button("Explain it back")!.click());
  await type("Bees dance to tell others where the food is.");
  await act(async () => button("Get feedback")!.click());

  expect(fetch).toHaveBeenLastCalledWith("/api/explain-back", expect.objectContaining({
    method: "POST",
    body: JSON.stringify({ title: "Bees", body: ["One", "Two", "Three"], explanation: "Bees dance to tell others where the food is." }),
  }));
  expect(container.textContent).toContain("You nailed the main idea.");
});

it("shows a failure and lets the reader try again without losing their text", async () => {
  routes({ feedback: Response.json({ error: "Daily token limit" }, { status: 429 }) });
  await render();
  await act(async () => button("Explain it back")!.click());
  await type("Bees dance to tell others where the food is.");
  await act(async () => button("Get feedback")!.click());
  expect(container.querySelector('[role="alert"]')?.textContent).toContain("Daily token limit");
  expect(textarea().value).toBe("Bees dance to tell others where the food is.");
  expect(button("Get feedback")!.disabled).toBe(false);
});
