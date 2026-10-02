// @vitest-environment happy-dom

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AccessRequest } from "@/lib/auth-guard";
import type { CronRunLogEntry, GenerationLogEntry } from "@/lib/types";
import { AdminAccessList } from "./AdminAccessList";
import { CronRunLog } from "./CronRunLog";
import { GenerationLog } from "./GenerationLog";

const person = (uid: string, status: AccessRequest["status"], autoGeneration?: boolean): AccessRequest => ({
  uid, email: `${uid}@example.com`, displayName: uid, status, firstSeenAt: "2026-09-01", lastSeenAt: "2026-09-01",
  ...(autoGeneration === undefined ? {} : { autoGeneration }),
});

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

const buttons = () => [...container.querySelectorAll("button")].map((b) => b.textContent);

describe("access list auto generation toggle", () => {
  const render = (requests: AccessRequest[], onToggle = vi.fn()) =>
    act(async () => root.render(createElement(AdminAccessList, { requests, onGrant: vi.fn(), onRevoke: vi.fn(), onToggleAutoGeneration: onToggle })));

  it("is shown only for people with access, as on by default", async () => {
    await render([person("alice", "granted"), person("bob", "pending"), person("cara", "revoked")]);
    expect(buttons().filter((label) => label?.startsWith("Auto lessons"))).toEqual(["Auto lessons: on"]);
  });

  it("turns auto generation off when it is on", async () => {
    const onToggle = vi.fn();
    await render([person("alice", "granted", true)], onToggle);
    await act(async () => [...container.querySelectorAll("button")].find((b) => b.textContent === "Auto lessons: on")!.click());
    expect(onToggle).toHaveBeenCalledWith("alice", false);
  });

  it("turns it back on when it is off", async () => {
    const onToggle = vi.fn();
    await render([person("alice", "granted", false)], onToggle);
    await act(async () => [...container.querySelectorAll("button")].find((b) => b.textContent === "Auto lessons: off")!.click());
    expect(onToggle).toHaveBeenCalledWith("alice", true);
  });
});

describe("cron run log", () => {
  const entry = (overrides: Partial<CronRunLogEntry>): CronRunLogEntry => ({
    date: "2026-10-02", createdAt: "2026-10-02T07:00:00.000Z", stoppedForTokenLimit: false, results: [], ...overrides,
  });
  const render = (entries: CronRunLogEntry[]) => act(async () => root.render(createElement(CronRunLog, { entries, requests: [] })));

  it("counts users skipped because auto generation is off", async () => {
    await render([entry({ results: [{ uid: "a", status: "auto-generation-off" }, { uid: "b", status: "generated" }] })]);
    expect(container.textContent).toContain("1 generated");
    expect(container.textContent).toContain("1 auto generation off");
  });

  it("shows why a run quit early", async () => {
    await render([entry({ error: "OpenAI has no credits remaining: 429 You have no credits remaining." })]);
    expect(container.textContent).toContain("OpenAI has no credits remaining");
  });
});

describe("generation log", () => {
  const entry = (overrides: Partial<GenerationLogEntry>): GenerationLogEntry => ({
    uid: "alice", title: "A lesson", createdAt: "2026-10-02T07:00:00.000Z", ...overrides,
  });
  const render = (entries: GenerationLogEntry[]) => act(async () => root.render(createElement(GenerationLog, { entries, requests: [] })));

  it("says a lesson was generated automatically by the nightly job", async () => {
    await render([entry({ source: "auto" })]);
    expect(container.textContent).toContain("Auto-generated");
  });

  it("says a lesson was generated when the user opened the page", async () => {
    await render([entry({ source: "on-access" })]);
    expect(container.textContent).toContain("Generated on page access");
  });

  it("doesn't guess for older entries logged before the source was recorded", async () => {
    await render([entry({})]);
    expect(container.textContent).not.toMatch(/Auto-generated|Generated on page access/);
  });
});
