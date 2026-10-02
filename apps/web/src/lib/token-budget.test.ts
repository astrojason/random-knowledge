import { beforeEach, expect, it, vi } from "vitest";
import { getTokensUsedToday, reportTokensUsed, TokenTrackerError } from "./token-budget";

beforeEach(() => {
  vi.resetAllMocks();
});

it("posts the token count to the tracker", async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);

  await reportTokensUsed(123);

  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining("/api/tokens"),
    expect.objectContaining({ method: "POST", body: JSON.stringify({ tokens: 123 }) })
  );
});

it("throws when the tracker responds with an error status, so callers can treat it as a failed generation", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("boom", { status: 500, statusText: "Internal Server Error" })));
  await expect(reportTokensUsed(123)).rejects.toThrow(/500/);
});

it("throws when the underlying fetch itself fails", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
  await expect(reportTokensUsed(123)).rejects.toThrow("network down");
});

it("reads today's usage from the tracker", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ tokens: 42 })));
  expect(await getTokensUsedToday()).toBe(42);
});

it.each([
  ["the request fails", () => vi.fn().mockRejectedValue(new Error("network down"))],
  ["it responds with an error status", () => vi.fn().mockResolvedValue(new Response("boom", { status: 502 }))],
  ["it responds with something that isn't JSON", () => vi.fn().mockResolvedValue(new Response("<html>", { status: 200 }))],
  ["the usage isn't a number", () => vi.fn().mockResolvedValue(Response.json({ tokens: "lots" }))],
  ["the usage is missing", () => vi.fn().mockResolvedValue(Response.json({}))],
])("throws a TokenTrackerError when %s, so callers never mistake an outage for zero usage", async (_name, fetchMock) => {
  vi.stubGlobal("fetch", fetchMock());
  await expect(getTokensUsedToday()).rejects.toBeInstanceOf(TokenTrackerError);
});
