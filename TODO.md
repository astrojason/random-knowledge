# TODO

## Follow-up

- [ ] Run `firebase emulators:start --only firestore,auth` once a project exists, and smoke-test sign-in + a lesson generation against the emulator before pointing at production
- [ ] Decide whether the token-tracker call (`apps/web/src/app/api/generate-lesson/route.ts`) should block on failure or keep failing open as currently implemented
