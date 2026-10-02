import { describe, expect, it } from "vitest";
import { autoGenerationEnabled, pausedFallbackDate } from "./paused-generation";
import type { AccessRequest } from "./auth-guard";
import type { HistoryEntry } from "./types";

const request = (autoGeneration?: boolean): AccessRequest => ({
  uid: "u1", email: "u1@example.com", displayName: "U1", status: "granted",
  firstSeenAt: "2026-09-01", lastSeenAt: "2026-09-01", ...(autoGeneration === undefined ? {} : { autoGeneration }),
});
const history: HistoryEntry[] = [
  { date: "2026-09-18", category: "nature", title: "Older" },
  { date: "2026-09-20", category: "physics", title: "Latest" },
];

describe("autoGenerationEnabled", () => {
  it.each([
    ["is on by default for a record that never set the flag", request(), true],
    ["is on when explicitly enabled", request(true), true],
    ["is off only when explicitly disabled", request(false), false],
    ["is on for people with no access record, such as admins", null, true],
    ["is on while the record is still loading", undefined, true],
  ])("%s", (_name, req, expected) => {
    expect(autoGenerationEnabled(req)).toBe(expected);
  });
});

describe("pausedFallbackDate", () => {
  it("is the date of the last generated lesson when auto generation is off", () => {
    expect(pausedFallbackDate(request(false), history)).toBe("2026-09-20");
  });

  it("is null when auto generation is on, so a new lesson is generated as usual", () => {
    expect(pausedFallbackDate(request(), history)).toBeNull();
  });

  it("is null when there is no earlier lesson, so a first lesson can still be generated", () => {
    expect(pausedFallbackDate(request(false), [])).toBeNull();
  });
});
