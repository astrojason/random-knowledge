import { beforeEach, expect, it, vi } from "vitest";
import { POST } from "./route";
import { getAccessRequestAdmin, verifyIdToken } from "@/lib/firebase-admin";
import { attachLessonAudio } from "@/lib/lesson-audio";
import { generateSourcedLesson } from "@/lib/lesson-generation";

vi.mock("@/lib/firebase-admin", () => ({ getAccessRequestAdmin: vi.fn(), verifyIdToken: vi.fn() }));
vi.mock("@/lib/lesson-audio", () => ({ attachLessonAudio: vi.fn() }));
vi.mock("@/lib/lesson-generation", () => ({ generateSourcedLesson: vi.fn() }));
vi.mock("openai", () => ({ default: class OpenAI {} }));

function request(body: unknown = { category: "nature" }, authorization = "Bearer token") {
  return new Request("http://localhost/api/generate-lesson", { method: "POST", headers: { authorization }, body: JSON.stringify(body) });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ tokens: 0 })));
  vi.mocked(verifyIdToken).mockResolvedValue({ uid: "reader", superadmin: true } as unknown as Awaited<ReturnType<typeof verifyIdToken>>);
  vi.mocked(generateSourcedLesson).mockResolvedValue({ title: "Verified lesson" } as Awaited<ReturnType<typeof generateSourcedLesson>>);
  vi.mocked(attachLessonAudio).mockImplementation(async (_path, l) => l);
});

it.each(["", "Basic token", "Bearer "])("rejects missing bearer tokens (%s)", async (header) => {
  expect((await POST(request({}, header))).status).toBe(401);
  expect(verifyIdToken).not.toHaveBeenCalled();
});

it("rejects invalid authentication", async () => {
  vi.mocked(verifyIdToken).mockRejectedValue(new Error("expired"));
  expect((await POST(request())).status).toBe(401);
  expect(generateSourcedLesson).not.toHaveBeenCalled();
});

it("requires granted access for non-admin users", async () => {
  vi.mocked(verifyIdToken).mockResolvedValue({ uid: "reader" } as Awaited<ReturnType<typeof verifyIdToken>>);
  vi.mocked(getAccessRequestAdmin).mockResolvedValue(null);
  expect((await POST(request())).status).toBe(403);
});

it.each([null, {}, { category: "invented" }])("rejects invalid lesson requests: %j", async (body) => {
  expect((await POST(request(body))).status).toBe(400);
  expect(generateSourcedLesson).not.toHaveBeenCalled();
});

it("enforces the daily token limit", async () => {
  vi.mocked(fetch).mockResolvedValue(Response.json({ tokens: 250_000 }));
  expect((await POST(request())).status).toBe(429);
  expect(generateSourcedLesson).not.toHaveBeenCalled();
});

it("passes only bounded text titles to generation", async () => {
  const response = await POST(request({ category: "nature", recentTitles: [false, ...Array.from({ length: 15 }, () => "x".repeat(250))] }));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ category: "nature", title: "Verified lesson" });
  expect(generateSourcedLesson).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ recentTitles: Array(12).fill("x".repeat(200)) }));
});

it("synthesizes narration for the generated lesson before responding", async () => {
  vi.mocked(attachLessonAudio).mockResolvedValue({ category: "nature", title: "Verified lesson", audioUrl: "https://storage.example/lesson.mp3" } as unknown as Awaited<ReturnType<typeof attachLessonAudio>>);
  const response = await POST(request());
  expect(attachLessonAudio).toHaveBeenCalledWith(
    expect.stringMatching(/^lesson-audio\/reader\/\d+\.mp3$/),
    { category: "nature", title: "Verified lesson" }
  );
  expect(await response.json()).toEqual({ category: "nature", title: "Verified lesson", audioUrl: "https://storage.example/lesson.mp3" });
});

it("returns a generation failure without a lesson", async () => {
  vi.mocked(generateSourcedLesson).mockRejectedValue(new Error("Source review failed"));
  const response = await POST(request());
  expect(response.status).toBe(502);
  expect(await response.json()).toEqual({ error: "Source review failed" });
});
