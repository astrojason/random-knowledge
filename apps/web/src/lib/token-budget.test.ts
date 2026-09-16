import { beforeEach, expect, it, vi } from "vitest";
import { reportTokensUsed } from "./token-budget";

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
