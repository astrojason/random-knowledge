# TODO

## Follow-up

- [ ] Run `firebase emulators:start --only firestore,auth` once a project exists, and smoke-test sign-in + a lesson generation against the emulator before pointing at production
- [ ] Decide whether the token-tracker call (`apps/web/src/app/api/generate-lesson/route.ts`) should block on failure or keep failing open as currently implemented
- [ ] Create the ElevenLabs voice clone and set `ELEVENLABS_API_KEY`/`ELEVENLABS_VOICE_ID` locally and in production so `ReadAloudButton` uses it instead of falling back to the browser voice
