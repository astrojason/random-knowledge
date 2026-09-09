# TODO

## Provisioning (not done by Claude Code — see setup-plan.md)

- [ ] Create the App Hosting backend once: `firebase apphosting:backends:create` (name it `daily-lesson` to match `scripts/deploy`, or set `APPHOSTING_BACKEND` when running the script)
- [ ] Set the production OpenAI key in Secret Manager: `firebase apphosting:secrets:set openai-api-key`

## Follow-up

- [ ] Run `firebase emulators:start --only firestore,auth` once a project exists, and smoke-test sign-in + a lesson generation against the emulator before pointing at production
- [ ] Decide whether the token-tracker call (`apps/web/src/app/api/generate-lesson/route.ts`) should block on failure or keep failing open as currently implemented
