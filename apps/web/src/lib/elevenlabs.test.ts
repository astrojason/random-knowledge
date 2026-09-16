import { beforeEach, expect, it, vi } from "vitest";
import { synthesizeSpeech } from "./elevenlabs";

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("ELEVENLABS_API_KEY", "key-123");
  vi.stubEnv("ELEVENLABS_VOICE_ID", "voice-abc");
});

it("posts the text to ElevenLabs with the configured voice and returns the audio bytes", async () => {
  const audioBytes = new Uint8Array([1, 2, 3]);
  const fetchMock = vi.fn().mockResolvedValue(new Response(audioBytes, { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);

  const result = await synthesizeSpeech("Hello there");

  expect(fetchMock).toHaveBeenCalledWith(
    "https://api.elevenlabs.io/v1/text-to-speech/voice-abc",
    expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ "xi-api-key": "key-123" }),
    })
  );
  const [, init] = fetchMock.mock.calls[0];
  expect(JSON.parse(init.body)).toMatchObject({ text: "Hello there" });
  expect(Buffer.from(result)).toEqual(Buffer.from(audioBytes));
});

it("throws a descriptive error when the API key or voice id is not configured", async () => {
  vi.stubEnv("ELEVENLABS_API_KEY", "");
  await expect(synthesizeSpeech("Hello")).rejects.toThrow(/not configured/i);
});

it("surfaces the response body when ElevenLabs rejects the request", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("quota exceeded", { status: 429, statusText: "Too Many Requests" })));
  await expect(synthesizeSpeech("Hello")).rejects.toThrow(/quota exceeded/);
});
