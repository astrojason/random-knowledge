const ELEVENLABS_MODEL = process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2";

/** Synthesizes text in the configured cloned voice via the ElevenLabs API and returns the MP3 bytes. */
export async function synthesizeSpeech(text: string): Promise<Uint8Array> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!apiKey || !voiceId) {
    throw new Error("ElevenLabs is not configured (set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID).");
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: ELEVENLABS_MODEL }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`ElevenLabs request failed (${response.status} ${response.statusText}): ${detail || "no error detail"}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}
