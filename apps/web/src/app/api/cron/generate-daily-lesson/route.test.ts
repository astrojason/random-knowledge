import { beforeEach, expect, it, vi } from "vitest";
import { POST } from "./route";
import { defaultWeights } from "@/lib/categories";
import {
  getDailyGenerationContextAdmin,
  getPushTokenAdmin,
  listGrantedUserIds,
  logCronRunAdmin,
  logGenerationAdmin,
  saveDailyLessonAdmin,
} from "@/lib/firebase-admin";
import { attachLessonAudio } from "@/lib/lesson-audio";
import { generateSourcedLesson } from "@/lib/lesson-generation";
import { sendBadgePush } from "@/lib/push";
import type { Lesson } from "@/lib/types";

vi.mock("@/lib/firebase-admin", () => ({
  listGrantedUserIds: vi.fn(),
  getDailyGenerationContextAdmin: vi.fn(),
  getPushTokenAdmin: vi.fn(),
  saveDailyLessonAdmin: vi.fn(),
  logGenerationAdmin: vi.fn(),
  logCronRunAdmin: vi.fn(),
}));
vi.mock("@/lib/lesson-audio", () => ({ attachLessonAudio: vi.fn() }));
vi.mock("@/lib/lesson-generation", () => ({ generateSourcedLesson: vi.fn() }));
vi.mock("@/lib/push", () => ({ sendBadgePush: vi.fn() }));
vi.mock("openai", () => ({ default: class OpenAI {} }));

const emptyContext = { existingLesson: null, weights: defaultWeights(), history: [], selectedCategories: ["nature" as const] };
const lesson = { title: "Verified lesson" } as unknown as Awaited<ReturnType<typeof generateSourcedLesson>>;

function request(authorization = "Bearer secret") {
  return new Request("http://localhost/api/cron/generate-daily-lesson", { method: "POST", headers: { authorization } });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("CRON_SECRET", "secret");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ tokens: 0 })));
  vi.mocked(listGrantedUserIds).mockResolvedValue(["alice"]);
  vi.mocked(getDailyGenerationContextAdmin).mockResolvedValue(emptyContext);
  vi.mocked(generateSourcedLesson).mockResolvedValue(lesson);
  vi.mocked(attachLessonAudio).mockImplementation(async (_path, l) => l);
  vi.mocked(logGenerationAdmin).mockResolvedValue(undefined);
  vi.mocked(logCronRunAdmin).mockResolvedValue(undefined);
  vi.mocked(getPushTokenAdmin).mockResolvedValue(null);
  vi.mocked(sendBadgePush).mockResolvedValue(undefined);
});

it("rejects requests without the cron secret configured", async () => {
  vi.stubEnv("CRON_SECRET", "");
  const response = await POST(request());
  expect(response.status).toBe(500);
  expect(listGrantedUserIds).not.toHaveBeenCalled();
});

it.each(["", "Bearer wrong", "Basic secret"])("rejects an incorrect bearer token (%s)", async (authorization) => {
  const response = await POST(request(authorization));
  expect(response.status).toBe(401);
  expect(listGrantedUserIds).not.toHaveBeenCalled();
});

it("generates and saves a lesson for a granted user without one today", async () => {
  const response = await POST(request());
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.results).toEqual([{ uid: "alice", status: "generated" }]);
  expect(saveDailyLessonAdmin).toHaveBeenCalledWith("alice", body.date, { category: "nature", ...lesson }, []);
});

it("logs the generation for admins after saving it", async () => {
  const response = await POST(request());
  const body = await response.json();
  expect(body.results).toEqual([{ uid: "alice", status: "generated" }]);
  expect(logGenerationAdmin).toHaveBeenCalledWith("alice", "Verified lesson");
});

it("still reports the lesson as generated when logging fails", async () => {
  vi.mocked(logGenerationAdmin).mockRejectedValue(new Error("firestore unavailable"));
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const response = await POST(request());
  const body = await response.json();
  expect(body.results).toEqual([{ uid: "alice", status: "generated" }]);
  expect(errorSpy).toHaveBeenCalled();
});

it("synthesizes narration for the generated lesson before saving it", async () => {
  vi.mocked(attachLessonAudio).mockResolvedValue({ category: "nature", ...lesson, audioUrl: "https://storage.example/lesson.mp3" } as Lesson);
  const response = await POST(request());
  const body = await response.json();
  expect(attachLessonAudio).toHaveBeenCalledWith(`lesson-audio/alice/${body.date}.mp3`, { category: "nature", ...lesson });
  expect(saveDailyLessonAdmin).toHaveBeenCalledWith(
    "alice", body.date,
    { category: "nature", ...lesson, audioUrl: "https://storage.example/lesson.mp3" },
    []
  );
});

it("badges the mobile app for a user with a registered device", async () => {
  vi.mocked(getPushTokenAdmin).mockResolvedValue({ token: "ExponentPushToken[abc]", platform: "ios", updatedAt: "2026-09-01" });
  const response = await POST(request());
  const body = await response.json();
  expect(body.results).toEqual([{ uid: "alice", status: "generated" }]);
  expect(sendBadgePush).toHaveBeenCalledWith("ExponentPushToken[abc]", 1);
});

it("does not send a push for a user with no registered device", async () => {
  const response = await POST(request());
  await response.json();
  expect(sendBadgePush).not.toHaveBeenCalled();
});

it("still reports the lesson as generated when the badge push fails", async () => {
  vi.mocked(getPushTokenAdmin).mockResolvedValue({ token: "stale-token", platform: "ios", updatedAt: "2026-09-01" });
  vi.mocked(sendBadgePush).mockRejectedValue(new Error("DeviceNotRegistered"));
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const response = await POST(request());
  const body = await response.json();
  expect(body.results).toEqual([{ uid: "alice", status: "generated" }]);
  expect(errorSpy).toHaveBeenCalled();
});

it("skips a user who already has today's lesson", async () => {
  vi.mocked(getDailyGenerationContextAdmin).mockResolvedValue({ ...emptyContext, existingLesson: { category: "nature" } as Lesson });
  const response = await POST(request());
  const body = await response.json();
  expect(body.results).toEqual([{ uid: "alice", status: "already-had-lesson" }]);
  expect(generateSourcedLesson).not.toHaveBeenCalled();
  expect(saveDailyLessonAdmin).not.toHaveBeenCalled();
});

it("retries a failed generation before succeeding", async () => {
  vi.mocked(generateSourcedLesson).mockRejectedValueOnce(new Error("rejected draft")).mockResolvedValueOnce(lesson);
  const response = await POST(request());
  const body = await response.json();
  expect(body.results).toEqual([{ uid: "alice", status: "generated" }]);
  expect(generateSourcedLesson).toHaveBeenCalledTimes(2);
});

it("reports a user as failed after exhausting retries", async () => {
  vi.mocked(generateSourcedLesson).mockRejectedValue(new Error("rejected draft"));
  const response = await POST(request());
  const body = await response.json();
  expect(body.results).toEqual([{ uid: "alice", status: "failed", error: "rejected draft" }]);
  expect(generateSourcedLesson).toHaveBeenCalledTimes(3);
});

it("stops before starting a user once the daily token limit is already reached", async () => {
  vi.mocked(fetch).mockResolvedValue(Response.json({ tokens: 250_000 }));
  const response = await POST(request());
  const body = await response.json();
  expect(body.stoppedForTokenLimit).toBe(true);
  expect(body.results).toEqual([]);
  expect(generateSourcedLesson).not.toHaveBeenCalled();
});

it("stops mid-retry once the token limit is hit and does not mark the user failed", async () => {
  vi.mocked(fetch)
    .mockResolvedValueOnce(Response.json({ tokens: 0 })) // pre-user check
    .mockResolvedValue(Response.json({ tokens: 250_000 })); // subsequent checks, incl. pre-attempt
  vi.mocked(generateSourcedLesson).mockRejectedValue(new Error("rejected draft"));
  const response = await POST(request());
  const body = await response.json();
  expect(body.stoppedForTokenLimit).toBe(true);
  expect(body.results).toEqual([]);
});

it("logs the full run, including a failed user, for admins", async () => {
  vi.mocked(generateSourcedLesson).mockRejectedValue(new Error("rejected draft"));
  const response = await POST(request());
  const body = await response.json();
  expect(logCronRunAdmin).toHaveBeenCalledWith(body.date, false, [
    { uid: "alice", status: "failed", error: "rejected draft" },
  ]);
});

it("still returns the run results when logging the run fails", async () => {
  vi.mocked(logCronRunAdmin).mockRejectedValue(new Error("firestore unavailable"));
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const response = await POST(request());
  const body = await response.json();
  expect(body.results).toEqual([{ uid: "alice", status: "generated" }]);
  expect(errorSpy).toHaveBeenCalled();
});
