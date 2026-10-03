import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";
import { getAccessRequestAdmin, verifyIdToken } from "@/lib/firebase-admin";
import { explainBackFeedback } from "@/lib/explain-back";

vi.mock("@/lib/firebase-admin", () => ({ getAccessRequestAdmin: vi.fn(), verifyIdToken: vi.fn() }));
vi.mock("@/lib/explain-back", () => ({ explainBackFeedback: vi.fn() }));
vi.mock("openai", () => ({ default: class OpenAI {} }));

const body = { title: "Bees", body: ["One", "Two", "Three"], explanation: "Bees dance to say where food is." };

function request(method: "GET" | "POST", payload: unknown = body, authorization = "Bearer token") {
  return new Request("http://localhost/api/explain-back", { method, headers: { authorization }, ...(method === "POST" && { body: JSON.stringify(payload) }) });
}
const usage = (tokens: number) => vi.mocked(fetch).mockResolvedValue(Response.json({ tokens }));

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("fetch", vi.fn());
  usage(0);
  vi.mocked(verifyIdToken).mockResolvedValue({ uid: "reader", superadmin: true } as unknown as Awaited<ReturnType<typeof verifyIdToken>>);
  vi.mocked(explainBackFeedback).mockResolvedValue("Nice work.");
});

describe.each([["GET", GET], ["POST", POST]] as const)("%s access", (method, handler) => {
  it("rejects a missing token", async () => {
    expect((await handler(request(method, body, ""))).status).toBe(401);
  });

  it("requires granted access for non-admin users", async () => {
    vi.mocked(verifyIdToken).mockResolvedValue({ uid: "reader" } as Awaited<ReturnType<typeof verifyIdToken>>);
    vi.mocked(getAccessRequestAdmin).mockResolvedValue(null);
    expect((await handler(request(method))).status).toBe(403);
  });
});

describe("availability", () => {
  it("is available while enough tokens remain", async () => {
    usage(100_000);
    expect(await (await GET(request("GET"))).json()).toEqual({ available: true });
  });

  it("is unavailable once the day's tokens are nearly used up", async () => {
    usage(240_000);
    expect(await (await GET(request("GET"))).json()).toEqual({ available: false });
  });

  it("reports a tracker outage as an error rather than assuming tokens remain", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(fetch).mockRejectedValue(new Error("down"));
    expect((await GET(request("GET"))).status).toBe(503);
  });
});

describe("giving feedback", () => {
  it("returns the model's feedback", async () => {
    const response = await POST(request("POST"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ feedback: "Nice work." });
    expect(explainBackFeedback).toHaveBeenCalledWith(expect.anything(), expect.objectContaining(body));
  });

  it("refuses, without calling the model, when too few tokens remain", async () => {
    usage(240_000);
    expect((await POST(request("POST"))).status).toBe(429);
    expect(explainBackFeedback).not.toHaveBeenCalled();
  });

  it("refuses, without calling the model, when usage can't be checked", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(fetch).mockRejectedValue(new Error("down"));
    expect((await POST(request("POST"))).status).toBe(503);
    expect(explainBackFeedback).not.toHaveBeenCalled();
  });

  it.each([
    null,
    {},
    { ...body, explanation: "   " },
    { ...body, explanation: "x".repeat(1501) },
    { ...body, body: "not an array" },
    { ...body, body: ["x".repeat(2001)] },
    { ...body, title: 5 },
  ])("rejects an invalid request: %j", async (payload) => {
    expect((await POST(request("POST", payload))).status).toBe(400);
    expect(explainBackFeedback).not.toHaveBeenCalled();
  });

  it("reports a generation failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(explainBackFeedback).mockRejectedValue(new Error("Feedback did not finish."));
    const response = await POST(request("POST"));
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "Feedback did not finish." });
  });
});
